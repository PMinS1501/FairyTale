import boto3
from io import BytesIO

### TTS region 
def synthesize_and_upload_tts(pages, voice_id="Seoyeon"):
    """
    Polly를 이용해 페이지 content를 TTS로 변환하고 S3에 mp3로 업로드
    """
    polly = boto3.client('polly', region_name="us-east-1")
    s3 = boto3.client('s3', region_name="us-east-1")
    PREFIX = "fairytale"+"/"  # 동화 prefix, TODO : 추후 중간 path를 사용자 지정 동화 이름이나 음성 파일명으로 바꿀 것"
    BUCKET = 'inha-capstone-07-jjang9-s3'


    for page in pages :
        content = page["content"]
        page_number = page["page"]
        
        # Polly 음성 합성
        response = polly.synthesize_speech(
            Engine = "neural", # 가장 자연스러움
            Text=content,
            OutputFormat="mp3",
            VoiceId=voice_id,
            LanguageCode="ko-KR"
        )
        
        audio_stream = response['AudioStream'].read()
        audio_bytes = BytesIO(audio_stream)
        
        # S3 경로 설정
        key = f"{PREFIX}page_{page_number}.mp3"
        
        # S3 업로드
        s3.upload_fileobj(audio_bytes, BUCKET, key, ExtraArgs={"ContentType": "audio/mpeg"})
        
        print(f"TTS uploaded: s3://{BUCKET}/{key}")
### TTS region end