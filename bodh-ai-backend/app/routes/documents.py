from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import (
    DocumentAnalysisResponse,
    DocumentQARequest,
    DocumentQAResponse,
)
from app.services import anthropic_service
import io

router = APIRouter(tags=["Documents"])

# Supported MIME types and their labels
SUPPORTED_TYPES = {
    "text/plain": "txt",
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/markdown": "md",
    "text/csv": "csv",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def _extract_text(file: UploadFile) -> str:
    """Extract plain text from an uploaded file."""
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    content_type = file.content_type or "text/plain"

    # Plain text / markdown / CSV — decode directly
    if content_type in ("text/plain", "text/markdown", "text/csv"):
        return content.decode("utf-8", errors="replace")

    # PDF — extract with pypdf
    if content_type == "application/pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not parse PDF: {e}")

    # DOCX — extract with python-docx
    if content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(para.text for para in doc.paragraphs)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Could not parse DOCX: {e}")

    # Fallback — try UTF-8 decode
    return content.decode("utf-8", errors="replace")


@router.post("/documents/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF, DOCX, TXT, MD, CSV) and get an AI-generated
    summary and key points.
    """
    text = await _extract_text(file)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from this file.")

    try:
        result = await anthropic_service.analyze_document_text(text)
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    return DocumentAnalysisResponse(
        filename=file.filename or "unknown",
        content_type=file.content_type or "text/plain",
        summary=result.get("summary", ""),
        key_points=result.get("key_points", []),
        word_count=len(text.split()),
    )


@router.post("/documents/qa", response_model=DocumentQAResponse)
async def question_answer(request: DocumentQARequest):
    """
    Ask a natural-language question about document text you have already
    extracted on the client side (or pass raw text directly).
    """
    if not request.document_text.strip():
        raise HTTPException(status_code=422, detail="document_text must not be empty.")

    try:
        answer = await anthropic_service.answer_document_question(
            question=request.question,
            document_text=request.document_text,
            model=request.model,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A failed: {e}")

    return DocumentQAResponse(question=request.question, answer=answer)


@router.post("/documents/analyze-with-question", response_model=DocumentQAResponse)
async def analyze_with_question(
    file: UploadFile = File(...),
    question: str = Form(...),
):
    """
    Upload a file AND ask a question about it in one request.
    Useful for one-shot document Q&A flows.
    """
    text = await _extract_text(file)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from this file.")

    try:
        answer = await anthropic_service.answer_document_question(
            question=question,
            document_text=text,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A failed: {e}")

    return DocumentQAResponse(question=question, answer=answer)
