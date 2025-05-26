import boto3
import random, json, base64
from io import BytesIO


# for Stability AI
import requests
import asyncio

### Image Generation region

def generate_image_and_save_s3_with_bedrock(prompts: str):
    client = boto3.client("bedrock-runtime", region_name="us-east-1")  # region 조정

    for page in prompts:
        prompt = build_prompt(page)
        
        # Generate a random seed.
        seed = random.randint(0, 2147483647)

        body = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": prompt, # 원하는 것
                "negativeText": "사실적인 얼굴, 현실적 색상" # 원하지 않는 것, e.g. 피해야 할 분위기
            },
            "imageGenerationConfig": {
                "quality": "standard",
                "numberOfImages": 1,
                "height": 1024,
                "width": 1024,
                "cfgScale": 7.5,
                "seed": seed
            }
        }

        response = client.invoke_model(
            modelId="amazon.titan-image-generator-v2:0",
            body=json.dumps(body),
            contentType="application/json"
        )

    response_body = json.loads(response["body"].read())
    image_data = base64.b64decode(response_body['images'][0])

    
    PREFIX = "fairytale"+"/"  # 동화 PREFIX, TODO : 추후 중간 path를 사용자 지정 동화 이름이나 음성 파일명으로 바꿀 것"

    # S3 저장
    s3 = boto3.client('s3', region_name="us-east-1")
    BUCKET = 'inha-capstone-07-jjang9-s3'
    
    key = f"{PREFIX}page_{page['page']}.png"
    s3.upload_fileobj(BytesIO(image_data), BUCKET, key, ExtraArgs={"ContentType": "image/png"})

    print(f"Uploaded: s3://{BUCKET}/{key}")


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


### Image Generation With Stability AI
from typing import Optional
import aiohttp
import asyncio
from dotenv import load_dotenv
import os
import time
import json
from PIL import Image
import IPython.display
import httpx

async def send_async_generation_request(
    host,
    params,
    files=None
    ):
    load_dotenv(dotenv_path="/home/ubuntu/backend-working-directory/FairyTale/.env")
    STABILITY_AI_API_KEY = os.getenv("STABILITY_AI_API_KEY")

    headers = {
        "Accept": "image/*",
        "Authorization": f"Bearer {STABILITY_AI_API_KEY}"
    }

    if files is None:
        files = {}

    # Encode parameters
    image = params.pop("image", None)
    mask = params.pop("mask", None)

    if image is not None and image != '':
        files["image"] = (image, open(image, 'rb'), "application/octet-stream")
    if mask is not None and mask != '':
        files["mask"] = (mask, open(mask, 'rb'), "application/octet-stream")

    if len(files) == 0:
        files["none"] = ("", "", "text/plain")  # 빈 파일 대체

    # Convert all other params to form fields
    form_data = {k: str(v) for k, v in params.items()}

    print(f"Sending ASYNC request to {host}...")

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
    output_format: str = "png"
):
    # prompt = "a cute magical forest with friendly animals and bright colors, illustrated style for children storybook" #@param {type:"string"}
    # negative_prompt = "realistic, scary, dark, horror, gore, creepy, violence" #@param {type:"string"}
    # aspect_ratio = "4:5" #@param ["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"]
    # style_preset = "fantasy-art"  # 또는 "anime", "digital-art", "comic-book", "pixel-art" // #@param ["None", "3d-model", "analog-film", "anime", "cinematic", "comic-book", "digital-art", "enhance", "fantasy-art", "isometric", "line-art", "low-poly", "modeling-compound", "neon-punk", "origami", "photographic", "pixel-art", "tile-texture"]
    # seed = 0 #@param {type:"integer"}
    # output_format = "png" # 무손실 압축 #@param ["webp", "jpeg", "png"]

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

    response = await send_async_generation_request(host, params)
    output_image = response.content
    response_headers = response.headers

    finish_reason = response_headers.get("finish-reason")
    seed = response_headers.get("seed")

    if finish_reason == 'CONTENT_FILTERED':
        raise Warning("Generation failed NSFW classifier")

    generated = f"generated_{seed}.{output_format}"
    with open(generated, "wb") as f:
        f.write(output_image)
    print(f"Saved image {generated}")

    print("Result image:")
    IPython.display.display(Image.open(generated))
    

if __name__ == "__main__":
    asyncio.run(generate_image_example(
        prompt="a cute magical forest with friendly animals and bright colors, illustrated style for children storybook",
        negative_prompt="blurry, low resolution, dark colors",
        aspect_ratio="4:5",
        style_preset="fantasy-art",
        seed=42,
        output_format="png"
    ))