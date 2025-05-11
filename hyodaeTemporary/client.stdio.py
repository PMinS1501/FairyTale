import asyncio
import json
import boto3
import logging
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def convert_tool_format(tools):
    """
    Converts tools into the format required for the Bedrock API.
    """
    converted_tools = []

    for tool in tools:
        converted_tool = {
            "toolSpec": {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": {"json": tool.inputSchema},
            }
        }
        converted_tools.append(converted_tool)

    return {"tools": converted_tools}


async def main():
    # Initialize Bedrock client
    bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

    async with stdio_client(
        StdioServerParameters(command="uv", args=["run", "mcp_simple_tool"])
    ) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List tools
            tools_result = await session.list_tools()
            tools_list = [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "inputSchema": tool.inputSchema,
                }
                for tool in tools_result.tools
            ]
            logger.info("Available tools: %s", tools_list)

            # Claude 3.5 system prompt
            system = [
                {
                    "text": "You are a helpful AI assistant. You have access to the following tools: "
                    + json.dumps(tools_list)
                }
            ]

            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": "Hello, can you help me fetch the website 'https://www.example.com?'"
                        }
                    ],
                }
            ]

            while True:
                # 💡 Claude 3.5 Sonnet 호출
                response = bedrock.converse(
                    modelId="anthropic.claude-3.5-sonnet-20240601-v1:0",
                    messages=messages,
                    system=system,
                    inferenceConfig={"maxTokens": 300, "topP": 0.1, "temperature": 0.3},
                    toolConfig=convert_tool_format(tools_result.tools),
                )

                output_message = response["output"]["message"]
                messages.append(output_message)
                stop_reason = response["stopReason"]

                for content in output_message["content"]:
                    if "text" in content:
                        print("Model:", content["text"])

                if stop_reason == "tool_use":
                    tool_requests = response["output"]["message"]["content"]
                    for tool_request in tool_requests:
                        if "toolUse" in tool_request:
                            tool = tool_request["toolUse"]
                            logger.info(
                                "Requesting tool %s. Request: %s",
                                tool["name"],
                                tool["toolUseId"],
                            )

                            try:
                                tool_response = await session.call_tool(
                                    tool["name"], tool["input"]
                                )
                                tool_result = {
                                    "toolUseId": tool["toolUseId"],
                                    "content": [{"text": str(tool_response)}],
                                }
                            except Exception as err:
                                logger.error("Tool call failed: %s", str(err))
                                tool_result = {
                                    "toolUseId": tool["toolUseId"],
                                    "content": [{"text": f"Error: {str(err)}"}],
                                    "status": "error",
                                }

                            messages.append(
                                {
                                    "role": "user",
                                    "content": [{"toolResult": tool_result}],
                                }
                            )
                else:
                    break


if __name__ == "__main__":
    asyncio.run(main())
