import boto3
import random, json, base64
from io import BytesIO

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