# main.py
from fastapi import FastAPI, File, UploadFile
from .s3_utils import upload_file_to_s3, get_file_url_from_s3

app = FastAPI()

@app.get("/")
async def test():
    return {"response": "test"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    업로드된 파일을 S3에 업로드하고 파일 URL을 반환합니다.
    """
    file_url = upload_file_to_s3(
        file.file,
        filename=file.filename,
        content_type=file.content_type
    )
    return {"file_url": file_url}

@app.get("/file/{filename}")
async def get_file_url(filename: str):
    """
    S3에서 파일 URL을 조회합니다.
    """
    file_url = get_file_url_from_s3(filename)
    return {"file_url": file_url}

