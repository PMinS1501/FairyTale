# s3_utils.py
import boto3
from botocore.exceptions import NoCredentialsError
from typing import Optional

# S3 클라이언트 생성
s3 = boto3.client("s3")

# 버킷 이름을 설정
BUCKET_NAME = "inha-capstone-07-jjang9-s3"

def upload_file_to_s3(file_obj, filename: str, content_type: str) -> str:
    """
    파일을 S3에 업로드하고 파일 URL을 반환합니다.
    """
    try:
        # S3에 파일 업로드
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=file_obj,
            ContentType=content_type
        )
        # 업로드된 파일의 URL 반환
        # file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
        file_url = f"https://inha-capstone-07-jjang9-s3.s3.amazonaws.com/{filename}"
        return file_url
    except NoCredentialsError as e:
        return {"error": str(e)}

def upload_mp3_file_to_s3(file_obj, filename: str, content_type: str) -> str:
    """
    파일을 S3의 특정 폴더에 업로드하고 파일 URL을 반환합니다.
    """
    try:
        # 저장할 S3 경로 설정 (예: audio/uploads/파일명)
        s3_key = f"audio/{filename}"

        # S3에 파일 업로드
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_obj,
            ContentType=content_type
        )

        # 업로드된 파일의 URL 반환
        file_url = f"https://inha-capstone-07-jjang9-s3.s3.amazonaws.com/{s3_key}"
        return file_url
    except NoCredentialsError as e:
        return {"error": str(e)}


def get_file_url_from_s3(filename: str) -> Optional[str]:
    """
    S3에서 파일 URL을 조회합니다.
    """
    try:
        # 파일 URL 조회
        # file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
        file_url = f"https://inha-capstone-07-jjang9-s3.s3.amazonaws.com/{filename}"
        return file_url
    except NoCredentialsError:
        return "Credentials not available"


import boto3
import json
from botocore.exceptions import NoCredentialsError


def get_fairy_tale_list_from_s3():
    """
    S3에서 파일 URL을 조회합니다.
    db 디렉토리에 접근하여 모든 데이터를 조회합니다.
    각각의 객체 형식은 아래와 같습니다.
    {
        "id": "1",
        "title": "title_test",
        "running_time": "780",
        "created_at": "2024-05-26T14:30:00Z",
        "thumbnail_url": "thumbnail_url_test",
        "fairy_tale_url": "fairy_tale_url_test"
    }
    n개의 객체를 list 형식으로 묶어 반환해야 합니다.
    """
    bucket_name = 'inha-capstone-07-jjang9-s3'
    prefix = 'db/'

    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

        fairy_tale_list = []

        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                if key.endswith('.json'):  # JSON 파일만 처리
                    file_obj = s3.get_object(Bucket=bucket_name, Key=key)
                    file_content = file_obj['Body'].read().decode('utf-8')
                    fairy_data = json.loads(file_content)
                    fairy_tale_list.append(fairy_data)

        return fairy_tale_list

    except NoCredentialsError:
        return "Credentials not available"
    except Exception as e:
        return f"An error occurred: {e}"


