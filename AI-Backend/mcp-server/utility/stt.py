import boto3
import time
import uuid
import requests

def transcribe_audio_from_s3(s3_uri="s3://inha-capstone-07-jjang9-s3/audio/question_0.mp3", language_code="ko-KR", region="us-east-1"):
    transcribe = boto3.client("transcribe", region_name=region)

    job_name = f"transcribe-job-{uuid.uuid4()}"
    
    # S3 URI에서 버킷과 키 분리
    if not s3_uri.startswith("s3://"):
        raise ValueError("S3 URI must start with 's3://'")
    s3_uri_parts = s3_uri.replace("s3://", "").split("/", 1)
    bucket = s3_uri_parts[0]
    key = s3_uri_parts[1]

    output_key = f"transcribe_output/{job_name}.json"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": s3_uri},
        MediaFormat="mp3",
        LanguageCode=language_code,
        OutputBucketName=bucket,
        OutputKey=output_key
    )

    print(f"[INFO] Started Transcribe Job: {job_name}")

    # Transcription job 상태 polling
    while True:
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        job = status["TranscriptionJob"]
        if job["TranscriptionJobStatus"] in ["COMPLETED", "FAILED"]:
            print(f"[INFO] Transcription Job Status: {job['TranscriptionJobStatus']}")
            break
        time.sleep(5)

    if job["TranscriptionJobStatus"] == "COMPLETED":
        transcript_uri = job["Transcript"]["TranscriptFileUri"]
        return transcript_uri
    else:
        raise Exception("Transcription job failed.")


def extract_text_from_transcribe_result(transcript_uri):
    response = requests.get(transcript_uri)
    if response.status_code != 200:
        raise Exception(f"Failed to download transcript: {response.status_code}")
    
    data = response.json()
    return data




# 사용 예시
s3_audio_path = "s3://inha-capstone-07-jjang9-s3/audio/question_1.mp3"

uri = transcribe_audio_from_s3(s3_audio_path)
data = extract_text_from_transcribe_result(uri)

print("[TRANSCRIBED TEXT]")
print(data["results"]["transcripts"][0]["transcript"])