import asyncio
import json
import boto3
import logging
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def convert_tool_format(tools):
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
    bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

    async with streamablehttp_client("http://localhost:8000/mcp") as (
        read_stream,
        write_stream,
        _,
    ):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

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

            # Claude 3는 system 프롬프트도 messages 리스트의 일부로 넣는다
            messages = [
                {
                    "role": "assistant",  # 'system'을 'assistant'로 변경
                    "content": [
                        {"text": "You are a helpful AI assistant. You have access to the following tools: "}
                    ]
                    + [{"text": json.dumps(tools_list)}],  # tools_list를 text로 감싸기
                },
                {
                    "role": "user",
                    "content": [
                        {"text": "Hello, can you help me to find all of the file in inha-capstone-07-jjang9-s3/norms? And Read the inner content."}
                    ]
                },
            ]

            while True:
                response = bedrock.converse(
                    modelId="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                    messages=messages,
                    inferenceConfig={
                        "maxTokens": 500,
                        "topP": 0.1,
                        "temperature": 0.3,
                    },
                    toolConfig=convert_tool_format(tools_result.tools),
                )

                output_message = response["output"]["message"]
                messages.append(output_message)
                stop_reason = response["stopReason"]

                for content in output_message["content"]:
                    if "text" in content:
                        print("Model:", content["text"])

                if stop_reason == "tool_use":
                    tool_requests = output_message["content"]
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
