from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


# ---------------------------------------------------------------------------
# Chat models
# ---------------------------------------------------------------------------

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history")
    system_prompt: Optional[str] = Field(
        None, description="Optional system prompt to guide the assistant"
    )
    model: Optional[str] = Field(
        "claude-sonnet-4-20250514", description="Model to use"
    )
    max_tokens: Optional[int] = Field(1024, ge=1, le=8096)
    stream: Optional[bool] = Field(False, description="Enable streaming response")


class ChatResponse(BaseModel):
    message: str
    model: str
    input_tokens: int
    output_tokens: int


# ---------------------------------------------------------------------------
# Document models
# ---------------------------------------------------------------------------

class DocumentAnalysisResponse(BaseModel):
    filename: str
    content_type: str
    summary: str
    key_points: List[str]
    word_count: Optional[int] = None


class DocumentQARequest(BaseModel):
    question: str
    document_text: str
    model: Optional[str] = Field("claude-sonnet-4-20250514")


class DocumentQAResponse(BaseModel):
    question: str
    answer: str


# ---------------------------------------------------------------------------
# Image models
# ---------------------------------------------------------------------------

class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Text prompt for image generation")
    size: Optional[str] = Field("1024x1024", description="Image dimensions")
    quality: Optional[str] = Field("standard", description="standard or hd")
    n: Optional[int] = Field(1, ge=1, le=4, description="Number of images")


class ImageGenerationResponse(BaseModel):
    images: List[str] = Field(..., description="List of image URLs or base64 strings")
    prompt: str
    revised_prompt: Optional[str] = None


# ---------------------------------------------------------------------------
# Health model
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict
