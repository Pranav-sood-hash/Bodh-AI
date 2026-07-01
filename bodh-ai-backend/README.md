# Bodh AI — Python Backend

A **FastAPI** backend for Bodh AI. Provides chat (Claude), document analysis, and image generation (DALL-E 3) via a clean REST API that mirrors the `/api/*` route convention of the React frontend.

---

## Project Structure

```
bodh-ai-backend/
├── app/
│   ├── main.py                  # FastAPI app + CORS + router registration
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   ├── routes/
│   │   ├── health.py            # GET /api/ping  GET /api/health
│   │   ├── chat.py              # POST /api/chat  POST /api/chat/stream
│   │   ├── documents.py         # POST /api/documents/analyze  /qa  /analyze-with-question
│   │   └── images.py            # POST /api/images/generate
│   └── services/
│       ├── anthropic_service.py # All Claude API calls
│       └── image_service.py     # DALL-E 3 image generation
├── .env.example                 # Copy to .env and fill in your keys
├── requirements.txt
├── run.py                       # Quick dev start
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
cd bodh-ai-backend
pip install -r requirements.txt
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### 3. Run the server

```bash
python run.py
```

Or with uvicorn directly:

```bash
uvicorn app.main:app --reload --port 8000
```

The API runs at **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

---

## API Reference

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ping` | Simple ping (matches Express behaviour) |
| GET | `/api/health` | Health check with service status |

---

### Chat

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Full response from Claude |
| POST | `/api/chat/stream` | Streaming SSE response from Claude |

**POST /api/chat — Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is Bodh AI?" }
  ],
  "system_prompt": "You are a helpful AI assistant called Bodh.",
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "message": "Bodh AI is ...",
  "model": "claude-sonnet-4-20250514",
  "input_tokens": 42,
  "output_tokens": 120
}
```

**POST /api/chat/stream** — Same request body. Response is an SSE stream:
```
data: {"chunk": "Bodh"}
data: {"chunk": " AI"}
data: {"chunk": " is..."}
data: [DONE]
```

How to consume in the frontend:
```typescript
const res = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...] }),
});
const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // parse "data: {...}\n\n" lines
}
```

---

### Documents

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/documents/analyze` | Upload file → summary + key points |
| POST | `/api/documents/qa` | Ask question about document text |
| POST | `/api/documents/analyze-with-question` | Upload file + ask question in one shot |

**POST /api/documents/analyze** — `multipart/form-data` with `file` field.

Supported file types: `.txt`, `.md`, `.csv`, `.pdf`, `.docx`

**Response:**
```json
{
  "filename": "report.pdf",
  "content_type": "application/pdf",
  "summary": "This document covers...",
  "key_points": ["Point 1", "Point 2"],
  "word_count": 3421
}
```

**POST /api/documents/qa** — JSON body:
```json
{
  "question": "What is the main conclusion?",
  "document_text": "The full text of the document..."
}
```

**POST /api/documents/analyze-with-question** — `multipart/form-data`:
- `file`: the document
- `question`: your question (form field)

---

### Images

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/generate` | Generate image with DALL-E 3 |

**Request body:**
```json
{
  "prompt": "A glowing brain made of circuit boards, neon colors",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

Valid sizes: `1024x1024`, `1792x1024`, `1024x1792`

**Response:**
```json
{
  "images": ["https://oaidalleapiprodscus.blob.core..."],
  "prompt": "A glowing brain...",
  "revised_prompt": "A luminous neural network..."
}
```

---

## Connecting the Frontend

In your React frontend, change the API base URL to point to this server.

During **development**, add a Vite proxy so `/api` requests go to Python instead of Express. In `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

This means you can keep calling `/api/chat` in your React code — Vite will forward it to FastAPI automatically.

---

## Adding New Endpoints

1. Create `app/routes/my_feature.py` with an `APIRouter`
2. Add business logic in `app/services/my_service.py`
3. Add request/response models in `app/models/schemas.py`
4. Register the router in `app/main.py`:
   ```python
   from app.routes import my_feature
   app.include_router(my_feature.router, prefix="/api")
   ```

---

## Requirements

- Python 3.11+
- An **Anthropic API key** (for chat and documents)
- An **OpenAI API key** (for image generation)
