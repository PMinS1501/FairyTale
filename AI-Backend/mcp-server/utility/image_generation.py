import boto3
import random, json, base64
from io import BytesIO


# for Stability AI
import requests
import asyncio

### Image Generation region

async def generate_image_and_save_s3(processed_prompt: dict):
    """
    Args:
        processed_prompt: {
            "title": "동화 제목",
            "pages": [
                {
                    "page": 0,
                    "content": "내용",
                    "emotion": "감정",
                    "color_theme": "색상 테마",
                    "background_elements": [배경 요소 리스트]
                },
                ...
            ]
        }

    Returns:
        s3_paths: List[str] - S3에 업로드된 이미지의 key 리스트
    """

    s3_paths = []
    seed = random.randint(1, 999999)
    
    for page in processed_prompt["pages"]:
        prompt = build_prompt(page)
        print("prompt: ", prompt)

        # try:
        #     s3_path = await generate_image_example(
        #         prompt=prompt,
        #         negative_prompt="blurry, low resolution, dark colors, horror, violence, text, letters",
        #         aspect_ratio="4:5",
        #         style_preset="fantasy-art",
        #         seed=seed,
        #         output_format="png",
        #         upload_to_s3=True,
        #         page_number=page["page"],
        #         title = processed_prompt["title"]
        #     )
        #     s3_paths.append(s3_path)
        # except Warning as e:
        #     print(f"⚠️ Page {page['page']} failed content filter: {e}")
        #     s3_paths.append(None)
        # except Exception as e:
        #     print(f"❌ Error generating image for page {page['page']}: {e}")
        #     s3_paths.append(None)

    return s3_paths



def build_prompt(page):
    return (
        f"Illustrate a children's storybook scene where:\n"
        f"- {page['content']}\n"
        f"- The scene expresses the emotion of \"{page['emotion']}\"\n"
        f"- The background includes: {', '.join(page['background_elements'])}.\n"
        f"- The color theme should reflect \"{page['color_theme']}\".\n"
        f"- Style: soft, cute, storybook illustration, watercolor texture, warm lighting.\n"
        f"- No text, no words, just the scene."
    )

### Image Generation region end


from typing import Optional
from PIL import Image
import IPython.display
import httpx
import os
import asyncio
from io import BytesIO
from dotenv import load_dotenv
import boto3

async def send_async_generation_request(host, params, files=None):
    load_dotenv(dotenv_path="/home/ubuntu/backend-working-directory/FairyTale/.env")
    STABILITY_AI_API_KEY = os.getenv("STABILITY_AI_API_KEY")

    headers = {
        "Accept": "image/*",
        "Authorization": f"Bearer {STABILITY_AI_API_KEY}"
    }

    if files is None:
        files = {}

    image = params.pop("image", None)
    mask = params.pop("mask", None)

    if image:
        files["image"] = (image, open(image, 'rb'), "application/octet-stream")
    if mask:
        files["mask"] = (mask, open(mask, 'rb'), "application/octet-stream")

    if not files:
        files["none"] = ("", "", "text/plain")

    form_data = {k: str(v) for k, v in params.items()}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            host,
            headers=headers,
            files=files,
            data=form_data,
        )

    if not response.is_success:
        raise Exception(f"HTTP {response.status_code}: {response.text}")

    return response

async def generate_image_example(
    prompt: str,
    negative_prompt: Optional[str] = None,
    aspect_ratio: str = "4:5",
    style_preset: Optional[str] = "fantasy-art",
    seed: int = 0,
    output_format: str = "png",
    upload_to_s3: bool = True,
    page_number: Optional[int] = None,
    title = "test_fairytale"
):
    host = "https://api.stability.ai/v2beta/stable-image/generate/core"
    params = {
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "aspect_ratio": aspect_ratio,
        "seed": seed,
        "output_format": output_format
    }
    if style_preset != "None":
        params["style_preset"] = style_preset
        
    # prompt = "a cute magical forest with friendly animals and bright colors, illustrated style for children storybook" #@param {type:"string"}
    # negative_prompt = "realistic, scary, dark, horror, gore, creepy, violence" #@param {type:"string"}
    # aspect_ratio = "4:5" #@param ["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"]
    # style_preset = "fantasy-art"  # 또는 "anime", "digital-art", "comic-book", "pixel-art" // #@param ["None", "3d-model", "analog-film", "anime", "cinematic", "comic-book", "digital-art", "enhance", "fantasy-art", "isometric", "line-art", "low-poly", "modeling-compound", "neon-punk", "origami", "photographic", "pixel-art", "tile-texture"]
    # seed = 0 #@param {type:"integer"}
    # output_format = "png" # 무손실 압축 #@param ["webp", "jpeg", "png"]

    response = await send_async_generation_request(host, params)
    output_image = response.content
    response_headers = response.headers

    finish_reason = response_headers.get("finish-reason")
    returned_seed = response_headers.get("seed") or str(seed)

    if finish_reason == 'CONTENT_FILTERED':
        raise Warning("Generation failed due to NSFW classifier")

    # 이미지 로컬 저장
    local_filename = f"/home/ubuntu/backend-working-directory/FairyTale/hyodaeTemporary/mcp-server/resources/test_image/{title}_image_page_{page_number}.{output_format}"
    with open(local_filename, "wb") as f:
        f.write(output_image)
    print(f"Saved image to Local Storage : {local_filename}")

    # 이미지 표시
    IPython.display.display(Image.open(local_filename))

    # S3 업로드
    if upload_to_s3:
        PREFIX = "fairytale/images/"
        BUCKET = "inha-capstone-07-jjang9-s3"
        key = f"{PREFIX}page_{page_number or returned_seed}.{output_format}"

        s3 = boto3.client("s3", region_name="us-east-1")
        s3.upload_fileobj(BytesIO(output_image), BUCKET, key, ExtraArgs={"ContentType": f"image/{output_format}"})

        print(f"Uploaded: s3://{BUCKET}/{key}")
        path = "s3://" + BUCKET + "/" + key
        return path  # S3 키 반환

    return local_filename

if __name__ == "__main__":
    asyncio.run(generate_image_example(
        prompt="a cute magical forest with friendly animals and bright colors, illustrated style for children storybook",
        negative_prompt="blurry, low resolution, dark colors",
        aspect_ratio="4:5",
        style_preset="fantasy-art",
        seed=42,
        output_format="png",
        upload_to_s3=True,
        page_number=1
    ))