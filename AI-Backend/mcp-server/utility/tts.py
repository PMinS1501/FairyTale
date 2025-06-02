import boto3
from io import BytesIO

### TTS region 
def synthesize_and_upload_tts(processed_prompt, voice_id="Seoyeon"):
    """
    Polly를 이용해 페이지 content를 TTS로 변환하고 S3에 mp3로 업로드
    업로드된 파일의 s3:// 경로 리스트를 반환
    """
    polly = boto3.client('polly', region_name="us-east-1")
    s3 = boto3.client('s3', region_name="us-east-1")
    PREFIX = "fairytale/tts/"
    BUCKET = 'inha-capstone-07-jjang9-s3'

    pages = processed_prompt["pages"]
    uploaded_s3_urls = []

    for page in pages:
        content = page["content"]
        page_number = page["page"]
        
        # Polly 음성 합성
        response = polly.synthesize_speech(
            Engine="neural",
            Text=content,
            OutputFormat="mp3",
            VoiceId=voice_id,
            LanguageCode="ko-KR"
        )
        
        audio_stream = response['AudioStream'].read()
        audio_bytes = BytesIO(audio_stream)
        
        # S3 경로 설정
        key = f"{PREFIX}page_{page_number}.mp3"
        s3_url = f"s3://{BUCKET}/{key}"
        
        # S3 업로드
        s3.upload_fileobj(audio_bytes, BUCKET, key, ExtraArgs={"ContentType": "audio/mpeg"})
        uploaded_s3_urls.append(s3_url)
        print(f"TTS uploaded: {s3_url}")

    return uploaded_s3_urls
### TTS region end
