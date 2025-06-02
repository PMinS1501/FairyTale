import asyncio, logging, sys, os

from .utility.stt import *
from .utility.llm import *
from .utility.image_generation import *
from .utility.tts import *





logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

    
    
def save_fairytale_metadata_to_s3(image_paths, tts_paths, json_scripts_paths, fairy_tale_id="default_fairytale"):
    """
    이미지, 음성, 자막 경로를 하나의 JSON 파일로 S3에 저장
    """
    s3 = boto3.client("s3", region_name="us-east-1")
    BUCKET = "inha-capstone-07-jjang9-s3"
    PREFIX = f"fairy_tale_url/{fairy_tale_id}/"
    KEY = PREFIX + "metadata.json"

    # 메타데이터 구성
    metadata = {
        "images": image_paths,
        "audios": tts_paths,
        "scripts": json_scripts_paths
    }

    # JSON 직렬화
    json_bytes = BytesIO(json.dumps(metadata, ensure_ascii=False, indent=2).encode("utf-8"))

    # 업로드
    s3.upload_fileobj(json_bytes, BUCKET, KEY, ExtraArgs={"ContentType": "application/json"})

    print(f"Metadata saved: s3://{BUCKET}/{KEY}")
    return f"s3://{BUCKET}/{KEY}"


async def main():

    s3_audio_path = "s3://inha-capstone-07-jjang9-s3/audio/question_1.mp3"
    
    ## STT -> MCP -> Image Genrating, TTS
    
    # 1. STT
    uri = transcribe_audio_from_s3(s3_audio_path)
    json_data_from_stt = extract_text_from_transcribe_result(uri)
    
    # 2. MCP ( LLM, 동화 생성 )
    num_pages, transcript = preprocessing(json_data_from_stt)
    llm_prompt = make_fairytale_prompt(num_pages, transcript)
    
    # 아래는 비동기 호출임에 유의
    processed_prompt, json_scripts_paths, title = await make_fairytale(llm_prompt, transcript)
    
    
    # json_scripts_paths가 경로가 됨
    
    # 3. Image Generating & save to s3
    # 아래는 비동기 호출임에 유의
    image_paths = await generate_image_and_save_s3(processed_prompt)
    
    # 4. TTS
    # TODO: tts 경로도 돌려줘야함
    tts_paths = synthesize_and_upload_tts(processed_prompt)
    
    # 5. 메타데이터 통합 및 저장
    metadata_s3_url = save_fairytale_metadata_to_s3(image_paths, tts_paths, json_scripts_paths, fairy_tale_id=title)



if __name__ == "__main__":
    asyncio.run(main())
