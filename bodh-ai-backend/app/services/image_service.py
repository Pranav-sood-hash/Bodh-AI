import os
from openai import AsyncOpenAI
from app.models.schemas import ImageGenerationRequest, ImageGenerationResponse


def _get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set in environment variables.")
    return AsyncOpenAI(api_key=api_key)


async def generate_images(request: ImageGenerationRequest) -> ImageGenerationResponse:
    """Generate images using OpenAI DALL-E 3."""
    client = _get_client()

    response = await client.images.generate(
        model="dall-e-3",
        prompt=request.prompt,
        size=request.size,
        quality=request.quality,
        n=request.n,           # Note: DALL-E 3 only supports n=1
        response_format="url", # or "b64_json" for inline base64
    )

    image_urls = [img.url for img in response.data]
    revised_prompt = response.data[0].revised_prompt if response.data else None

    return ImageGenerationResponse(
        images=image_urls,
        prompt=request.prompt,
        revised_prompt=revised_prompt,
    )
