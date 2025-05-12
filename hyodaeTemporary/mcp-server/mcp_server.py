import httpx
import argparse
import logging
import os
import boto3
import asyncio
from pydantic import Field
from resources.s3_resource import S3Resource
from typing import List, Optional, Dict

from mcp.server.fastmcp import FastMCP
from mcp.types import Resource



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get max buckets from environment or use default
max_buckets = int(os.getenv('S3_MAX_BUCKETS', '5'))

# Initialize S3 resource
s3_resource = S3Resource(
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    max_buckets=max_buckets
)

boto3_s3_client = boto3.client('s3')

def create_fetch_url_tool(mcp):
    
    # Example of mcp tool
    @mcp.tool()
    async def fetch_url(
        url: str = Field(description="URL to fetch"),
    ) -> str:
        """Fetches a website and returns its content"""
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return response.text

    return fetch_url

def read_resource_from_s3_tool(mcp):
    @mcp.tool()
    async def read_s3_resource(
        uri: str
    ) -> str:
        # 이렇게 """ 으로 감싸진 description이 무조건 필요함
        """
        Read content from an S3 resource and return structured response

        Returns:
            Dict containing 'contents' list with uri, mimeType, and text for each resource
        """
        uri_str = str(uri)
        logger.debug(f"Reading resource: {uri_str}")
        
        if not uri_str.startswith("s3://"):
            raise ValueError("Invalid S3 URI")
        
        # Parse the S3 URI
        from urllib.parse import unquote
        path = uri_str[5:]  # Remove "s3://"
        path = unquote(path)  # Decode URL-encoded characters
        parts = path.split("/", 1)

        if len(parts) < 2:
            raise ValueError("Invalid S3 URI format")
        
        bucket_name = parts[0]
        key = parts[1]

        logger.debug(f"Attempting to read - Bucket: {bucket_name}, Key: {key}")
        

        try:
            response = await s3_resource.get_object(bucket_name, key)
            content_type = response.get("ContentType", "")
            logger.debug(f"Read MIMETYPE response: {content_type}")

            # Content type mapping for specific file types
            content_type_mapping = {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/markdown",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "application/csv",
                "application/vnd.ms-excel": "application/csv"
            }

            # Check if content type needs to be modified
            export_mime_type = content_type_mapping.get(content_type, content_type)
            logger.debug(f"Export MIME type: {export_mime_type}")

            if 'Body' in response:
                if isinstance(response['Body'], bytes):
                    data = response['Body']
                else:
                    # Handle streaming response
                    async with response['Body'] as stream:
                        data = await stream.read()

                # Process the data based on file type
                if s3_resource.is_text_file(key):
                    # text_content = data.decode('utf-8')
                    text_content = base64.b64encode(data).decode('utf-8')

                    return text_content
                else:
                    text_content = str(base64.b64encode(data))

                    result = ReadResourceResult(
                        contents=[
                            BlobResourceContents(
                                blob=text_content,
                                uri=uri_str,
                                mimeType=export_mime_type
                            )
                        ]
                    )

                    logger.debug(result)

                    return text_content
                
            else:
                raise ValueError("No data in response body")
            
        except Exception as e:
            logger.error(f"Error reading object {key} from bucket {bucket_name}: {str(e)}")
            if 'NoSuchKey' in str(e):
                try:
                    # List similar objects to help debugging
                    objects = await s3_resource.list_objects(bucket_name, prefix=key.split('/')[0])
                    similar_objects = [obj['Key'] for obj in objects if 'Key' in obj]
                    logger.debug(f"Similar objects found: {similar_objects}")
                except Exception as list_err:
                    logger.error(f"Error listing similar objects: {str(list_err)}")
            raise ValueError(f"Error reading resource: {str(e)}")
    
    return read_s3_resource

def list_resources_from_s3_tool(mcp):
    
    @mcp.tool()
    async def list_s3_resources(
        start_after: Optional[str] = None
    ) -> List[Resource]:
        """
        List S3 buckets and their contents as resources with pagination
        Args:
            start_after: Start listing after this bucket name
        """
        resources = []
        logger.debug("Starting to list resources")
        logger.debug(f"Configured buckets: {s3_resource.configured_buckets}")

        try:
            # Get limited number of buckets
            buckets = await s3_resource.list_buckets(start_after)
            logger.debug(f"Processing {len(buckets)} buckets (max: {s3_resource.max_buckets})")

            # limit concurrent operations
            async def process_bucket(bucket):
                bucket_name = bucket['Name']
                logger.debug(f"Processing bucket: {bucket_name}")

                try:
                    # List objects in the bucket with a reasonable limit
                    objects = await s3_resource.list_objects(bucket_name, max_keys=1000)

                    for obj in objects:
                        if 'Key' in obj and not obj['Key'].endswith('/'):
                            object_key = obj['Key']
                            mime_type = "text/plain" if s3_resource.is_text_file(object_key) else "text/markdown"

                            resource = Resource(
                                uri=f"s3://{bucket_name}/{object_key}",
                                name=object_key,
                                mimeType=mime_type
                            )
                            resources.append(resource)
                            logger.debug(f"Added resource: {resource.uri}")

                except Exception as e:
                    logger.error(f"Error listing objects in bucket {bucket_name}: {str(e)}")

            # Use semaphore to limit concurrent bucket processing
            semaphore = asyncio.Semaphore(3)  # Limit concurrent bucket processing
            async def process_bucket_with_semaphore(bucket):
                async with semaphore:
                    await process_bucket(bucket)

            # Process buckets concurrently
            await asyncio.gather(*[process_bucket_with_semaphore(bucket) for bucket in buckets])

        except Exception as e:
            logger.error(f"Error listing buckets: {str(e)}")
            raise

        logger.info(f"Returning {len(resources)} resources")
        return resources

        
    return list_s3_resources



if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run MCP server with optional transport and port"
    )
    
    parser.add_argument("--transport", type=str, help="Transport method to use")    
    parser.add_argument(
        "--port", type=int, default=8000, help="Port to run server on (default: 8000)"
    )
    
    args = parser.parse_args()

    if args.transport == "streamable-http":
        mcp = FastMCP("Echo", port=args.port)
        
        # Register the tool
        create_fetch_url_tool(mcp)
        read_resource_from_s3_tool(mcp)
        list_resources_from_s3_tool(mcp)
    
        mcp.run(transport="streamable-http")
    else:
        mcp = FastMCP("Echo", port=args.port)
        # Register the tool
        create_fetch_url_tool(mcp)
        mcp.run()