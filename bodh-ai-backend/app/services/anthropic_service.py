import os
from groq import AsyncGroq
from typing import AsyncIterator
from app.models.schemas import ChatMessage, ChatResponse

MODEL = "llama-3.3-70b-versatile"


def _get_client() -> AsyncGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError("GROQ_API_KEY is not set in your .env file.")
    return AsyncGroq(api_key=api_key)


async def send_chat(
    messages: list[ChatMessage],
    system_prompt: str | None,
    model: str,
    max_tokens: int,
) -> ChatResponse:
    client = _get_client()

    api_messages = []
    if system_prompt:
        api_messages.append({"role": "system", "content": system_prompt})
    for m in messages:
        api_messages.append({"role": m.role.value, "content": m.content})

    response = await client.chat.completions.create(
        model=MODEL,
        messages=api_messages,
        max_tokens=max_tokens,
    )

    return ChatResponse(
        message=response.choices[0].message.content,
        model=MODEL,
        input_tokens=response.usage.prompt_tokens,
        output_tokens=response.usage.completion_tokens,
    )


async def stream_chat(
    messages: list[ChatMessage],
    system_prompt: str | None,
    model: str,
    max_tokens: int,
) -> AsyncIterator[str]:
    client = _get_client()

    api_messages = []
    if system_prompt:
        api_messages.append({"role": "system", "content": system_prompt})
    for m in messages:
        api_messages.append({"role": m.role.value, "content": m.content})

    stream = await client.chat.completions.create(
        model=MODEL,
        messages=api_messages,
        max_tokens=max_tokens,
        stream=True,
    )

    async for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:
            yield text


async def analyze_document_text(
    document_text: str,
    model: str = MODEL,
) -> dict:
    client = _get_client()

    prompt = f"""Analyze the following document and provide:
1. A concise summary (2-3 sentences)
2. A list of 3-7 key points

Respond in this exact JSON format:
{{
  "summary": "...",
  "key_points": ["point 1", "point 2", "..."]
}}

Document:
{document_text[:50000]}"""

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    import json
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


async def answer_document_question(
    question: str,
    document_text: str,
    model: str = MODEL,
) -> str:
    client = _get_client()

    prompt = f"""You are a helpful document assistant. Answer the following question based ONLY on the provided document. If the answer is not in the document, say so clearly.

Question: {question}

Document:
{document_text[:50000]}"""

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    return response.choices[0].message.content