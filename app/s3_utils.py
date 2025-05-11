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

