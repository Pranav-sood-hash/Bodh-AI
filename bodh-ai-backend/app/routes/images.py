from fastapi import APIRouter, HTTPException
from app.models.schemas import ImageGenerationRequest, ImageGenerationResponse
from app.services import image_service

router = APIRouter(tags=["Images"])


@router.post("/images/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """
    Generate an image using DALL-E 3.

    Provide a descriptive `prompt`. The model may refine it slightly
    (returned as `revised_prompt`) to improve safety and quality.

    Supported sizes: 1024x1024, 1792x1024, 1024x1792
    """
    try:
        return await image_service.generate_images(request)
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
