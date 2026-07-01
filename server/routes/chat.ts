import { RequestHandler } from "express";

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  system_prompt: string;
  model: string;
  max_tokens: number;
  stream: boolean;
  apiKey?: string;
}

interface ChatResponse {
  message: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages, system_prompt, model, max_tokens, apiKey: clientApiKey } = req.body as ChatRequest;

    // Validate required fields
    if (!messages || !model || !system_prompt) {
      return res.status(400).json({ error: "Missing required fields: messages, model, system_prompt" });
    }

    // Accept API key from client or fallback to environment variable
    const apiKey = clientApiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("No API key provided - client key:", !!clientApiKey, "env key:", !!process.env.GROQ_API_KEY);
      return res.status(401).json({ error: "GROQ_API_KEY not configured. Please set your API key in Settings." });
    }

    console.log(`Chat request: model=${model}, messages=${messages.length}, maxTokens=${max_tokens}`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system_prompt },
          ...messages,
        ],
        max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Groq API error:", response.status, error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected Groq response format:", data);
      return res.status(500).json({ error: "Unexpected response format from Groq API" });
    }

    const aiMessage = data.choices[0].message.content;

    const result: ChatResponse = {
      message: aiMessage,
    };

    console.log(`Chat response successful: ${aiMessage.length} characters`);
    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Failed to process chat request: ${errorMessage}` });
  }
};
