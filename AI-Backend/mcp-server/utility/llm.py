import boto3
import re, json, logging
from io import BytesIO
import uuid

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

### MCP region
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

def split_sentences(text):
    # 마침표 기준으로 분리 후, 빈 문장 제거 및 공백 제거
    return [s.strip() for s in text.split('.') if s.strip()]

def preprocessing(json_data_from_stt):
    output = {"transcript": []}

    for segment in json_data_from_stt["results"]["audio_segments"]:
        sentences = split_sentences(segment["transcript"])
        output["transcript"].append({
            "page_id": segment["id"],
            "sentences": sentences
        })
    num_pages = len(output["transcript"])
    transcript = json.dumps(output, ensure_ascii=False, indent=2)
    
    return num_pages, transcript

async def make_fairytale(assistant_prompt, transcript):
    bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
    processed_prompt = ""
    async with streamablehttp_client("http://localhost:6000/mcp/") as (
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
                        {"text": assistant_prompt}
                    ]
                    + [{"text": json.dumps(tools_list)}],  # tools_list를 text로 감싸기
                },
                {
                    "role": "user",
                    "content": [
                        {"text":
                        f"""아이의 음성 기록을 참고해 동화를 만들거야.
                         동화는 s3://inha-capstone-07-jjang9-s3/norms/*.json의 교훈 키워드와 예시,
                         그리고 s3://inha-capstone-07-jjang9-s3/story_cliche.json의 유명 동화 플롯 정보를 참조해서 아이에게 맞춤형으로 만들도록 해줘.
                         항상 교훈이 있어야 해.
                         다음은 아이의 실제 발화에서 추출한 전체 스크립트야:

                        \"\"\"{transcript}\"\"\"
                        """}
                    ]
                },
            ]

            while True:
                response = bedrock.converse(
                    modelId="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                    messages=messages,
                    inferenceConfig={
                        "maxTokens": 5000,
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
                        result = extract_json_from_text(content["text"])
                        if result != -1 :
                            processed_prompt = result

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
                
    result = extract_json_from_message(messages[-1])

    num_pages = len(result["pages"])

    safe_title = sanitize_title_for_s3(result["title"])
    await save_fairytale_scripts_to_s3(result["pages"], safe_title)
    json_script_paths = generate_fairytale_script_paths(num_pages, safe_title)
    """ json 경로 예시
    [
        {
            "page": 0,
            "s3_path": "s3://inha-capstone-07-jjang9-s3/fairytale/scripts/page_0.json"
        },
        {
            "page": 1,
            "s3_path": "s3://inha-capstone-07-jjang9-s3/fairytale/scripts/page_1.json"
        },
        ...   
    ]
    """
    print("전체 페이지별 S3 경로 목록:", json.dumps(json_script_paths, ensure_ascii=False, indent=2))

    return result, json_script_paths, safe_title



def sanitize_title_for_s3(title):
    return re.sub(r'[^\w\s-]', '', title).strip().replace(" ", "_")

async def save_fairytale_scripts_to_s3(processed_prompt_list, title):
    BUCKET = "inha-capstone-07-jjang9-s3"
    PREFIX = f"fairytale/scripts/{title}/"
    s3 = boto3.client("s3", region_name="us-east-1")

    for page_data in processed_prompt_list:
        page_number = page_data["page"]
        key = f"{PREFIX}page_{page_number}.json"
        data = json.dumps(page_data, ensure_ascii=False).encode("utf-8")

        s3.upload_fileobj(BytesIO(data), BUCKET, key, ExtraArgs={"ContentType": "application/json"})
        print(f"✅ Uploaded script: s3://{BUCKET}/{key}")
        
def generate_fairytale_script_paths(num_pages, title):
    BUCKET = "inha-capstone-07-jjang9-s3"
    PREFIX = f"fairytale/scripts/{title}/"
    script_paths = []

    for page_num in range(num_pages):
        s3_path = f"s3://{BUCKET}/{PREFIX}page_{page_num}.json"
        script_paths.append({
            "page": page_num,
            "s3_path": s3_path
        })

    return script_paths

def make_fairytale_prompt(num_pages, transcript):
    return f"""
        너는 유아 및 초등학교 저학년 어린이를 위한 동화 작가야. 아래에 주어진 아이의 음성 대본을 참고하여, 아이가 주인공이 되는 동화를 구성해줘.
        이 동화는 다음의 조건을 반드시 따라야 해:

        ---

        📘 **동화 구조**

        - 동화 전체는 JSON 객체 하나로 출력돼야 해.
        - 최상위 필드는 다음과 같아:
            - "title": 동화의 분위기와 핵심 교훈을 잘 담은 짧고 인상적인 제목
            - "pages": 각 페이지 정보를 담은 리스트 (총 {num_pages}개)
        - "pages" 리스트 안의 각 항목은 다음과 같은 JSON 객체야:
            - "page": 페이지 번호 (0부터 시작)
            - "content": 동화 한 문장 (아이도 이해할 수 있는 쉬운 표현)
            - "emotion": 이 장면에서 주인공의 감정 (예: 기쁨, 놀람, 슬픔, 걱정 등)
            - "color_theme": 이 장면을 시각화했을 때 떠오르는 색감/분위기 (예: 노란 햇살, 보랏빛 밤하늘, 초록 숲길 등)
            - "background_elements": 장면 배경을 구성하는 시각적 요소들 (리스트 형태, 예: ["책상", "창문", "노트북", "별"])
        - **"title"은 "pages" 리스트와 같은 계층**에 있어야 해. 각 페이지 안에 들어가면 안 돼.

        ---

        📚 **동화 플롯과 교훈 구조 참고**

        - 이야기에는 시작, 중간, 끝이 있어야 하고, **마지막에는 자연스러운 교훈이 담겨야 해**.
        - 문장은 아이들이 이해할 수 있을 만큼 간단하고 친절한 표현을 사용해줘.
        - 아래 S3 경로에 있는 JSON 파일들을 참고하여, 동화의 **전개 방식**과 **주제적 교훈**을 자연스럽게 녹여줘.
        - 동화의 마지막은 아이가 배울 수 있는 의미 있는 **교훈**으로 마무리돼야 해.

        🔍 참고 메타데이터:
        1. **교훈 키워드 및 예시 상황들**
        - 경로: s3://inha-capstone-07-jjang9-s3/norms/*.json
        - 내용: 각 JSON 파일은 하나의 "keyword"(예: 사과, 용기, 우정 등)와 "examples"(구체적인 상황 설명 리스트)를 포함해.
        - 이 키워드와 예시를 기반으로 동화의 마지막 메시지를 구성해줘.

        2. **유명 동화들의 전개 구조 및 클리셰 정보**
        - 경로: s3://inha-capstone-07-jjang9-s3/story_cliche.json
        - 내용: 각 동화는 "title", "structure", "theme", "cliche" 등의 항목으로 구성돼 있어.
        - 이 구조들을 적절히 참조해서 **탄탄한 전개 흐름**을 만들어줘.

        ---

        📝 **입력 데이터 (아이의 발화)**

        이거는 이따가 사용자가 직접 넣어줄거야.

        ---

        🎯 **출력 형식 예시**
            
        ```json
        {{
            "title": "토토와 별의 약속",
            "pages": [
                {{
                    "page": 0,
                    "content": "토토는 밤마다 별을 세느라 잠을 늦게 잤어요.",
                    "emotion": "호기심",
                    "color_theme": "보랏빛 밤하늘",
                    "background_elements": ["밤하늘", "별", "창문", "이불"]
                }},
                {{
                    "page": 1,
                    "content": "다음 날 아침, 토토는 피곤해서 학교에 지각했어요.",
                    "emotion": "걱정",
                    "color_theme": "희미한 아침 햇살",
                    "background_elements": ["유치원", "시계", "가방", "교실"]
                }}
            ]
        }}
        ```
        ]
        📌 출력은 위와 같이 backticks 3개로 둘러쌓인 JSON 배열 형식만으로 해줘. JSON 외의 설명은 하지 마.
        """
        
        
def extract_json_from_message(message):
    try:
        content = message["content"][0]["text"]
        match = re.search(r"```json\n(.*?)\n```", content, re.DOTALL)
        if match:
            return json.loads(match.group(1))
    except Exception as e:
        print("❌ Error:", e)
    return None
    
def extract_json_from_text(text: str):
    match = re.search(r"```json\s*(\[\s*\{.*?\}\s*\])\s*```", text, re.DOTALL)
    if match:
        json_str = match.group(1)
        return json.loads(json_str)
    else:
        return -1
### MCP region end