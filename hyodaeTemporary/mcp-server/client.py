import asyncio, logging, sys, os

from utility.stt import *
from utility.llm import *
from utility.image_generation import *
from utility.tts import *





logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():

    s3_audio_path = "s3://inha-capstone-07-jjang9-s3/audio/question_1.mp3"
    
    ## STT -> MCP -> Image Genrating, TTS
    
    # 1. STT
    uri = transcribe_audio_from_s3(s3_audio_path)
    json_data_from_stt = extract_text_from_transcribe_result(uri)
    
    # 2. MCP ( LLM, 동화 생성 )
    num_pages, transcript = preprocessing(json_data_from_stt)
    llm_prompt = make_fairytale_prompt(num_pages, transcript)
    processed_prompt = await make_fairytale(llm_prompt, transcript)
    
    # 3. Image Generating
    # generate_image_and_save_s3_with_bedrock(processed_prompt)
    
    # 4. TTS
    synthesize_and_upload_tts(processed_prompt)


if __name__ == "__main__":
    asyncio.run(main())