from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.services import anthropic_service
import json

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to Bodh AI and get a full response.

    Pass the full conversation history in `messages` to maintain context.
    Optionally provide a `system_prompt` to guide the assistant's behaviour.
    """
    try:
        return await anthropic_service.send_chat(
            messages=request.messages,
            system_prompt=request.system_prompt,
            model=request.model,
            max_tokens=request.max_tokens,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream a chat response from Bodh AI as Server-Sent Events (SSE).

    The frontend should consume this with the EventSource API or
    a fetch() with a ReadableStream reader.

    Each SSE event looks like:
        data: {"chunk": "Hello"}
        data: [DONE]
    """
    try:
        async def event_generator():
            async for chunk in anthropic_service.stream_chat(
                messages=request.messages,
                system_prompt=request.system_prompt,
                model=request.model,
                max_tokens=request.max_tokens,
            ):
                payload = json.dumps({"chunk": chunk})
                yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",   # disable Nginx buffering
            },
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream error: {str(e)}")
