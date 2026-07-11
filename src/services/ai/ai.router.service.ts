import { SYSTEM_PROMPTS } from '../../config/constants';
import { logger } from '../../utils/logger';

interface CallAIParams {
  provider: string;
  rawKey: string;
  model?: string;
  messages: Array<{ role: string; content: string }>;
  mode: string;
  maxTokens?: number;
}

interface AIResult {
  content: string;
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export const callAI = async (params: CallAIParams): Promise<AIResult> => {
  const { provider, rawKey, model, messages, mode, maxTokens = 4000 } = params;
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.FREE_CHAT;

  logger.info(`[AI] Calling provider=${provider.toUpperCase()} mode=${mode}`);

  const isPlaceholder = (key: string) => {
    return !key || key.toLowerCase().includes('your_') || key.toLowerCase().includes('placeholder');
  };

  const executeProviderCall = async (prov: string, key: string, mdl?: string): Promise<AIResult> => {
    switch (prov.toUpperCase()) {
      case 'OPENAI': {
        const { default: OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: key });
        const resp = await client.chat.completions.create({
          model: mdl || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role as any, content: m.content })),
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        });
        return {
          content: resp.choices[0].message.content || '',
          model: resp.model,
          tokens: {
            prompt: resp.usage?.prompt_tokens || 0,
            completion: resp.usage?.completion_tokens || 0,
            total: resp.usage?.total_tokens || 0,
          },
        };
      }
      case 'ANTHROPIC': {
        const Anthropic = await import('@anthropic-ai/sdk');
        const client = new Anthropic.default({ apiKey: key });
        const resp = await client.messages.create({
          model: mdl || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' as const : 'assistant' as const,
            content: m.content,
          })),
        });
        const textBlock = resp.content[0];
        return {
          content: textBlock.type === 'text' ? textBlock.text : '',
          model: resp.model,
          tokens: {
            prompt: resp.usage.input_tokens,
            completion: resp.usage.output_tokens,
            total: resp.usage.input_tokens + resp.usage.output_tokens,
          },
        };
      }
      case 'GEMINI': {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(key);
        const gemModel = genAI.getGenerativeModel({
          model: mdl || 'gemini-1.5-pro',
          systemInstruction: systemPrompt,
        });
        const chat = gemModel.startChat({
          history: messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        });
        const lastMsg = messages[messages.length - 1];
        const resp = await chat.sendMessage(lastMsg.content);
        const usageMeta = resp.response.usageMetadata;
        return {
          content: resp.response.text(),
          model: mdl || 'gemini-1.5-pro',
          tokens: {
            prompt: usageMeta?.promptTokenCount || 0,
            completion: usageMeta?.candidatesTokenCount || 0,
            total: usageMeta?.totalTokenCount || 0,
          },
        };
      }
      case 'GROQ': {
        const Groq = await import('groq-sdk');
        const client = new Groq.default({ apiKey: key });
        const resp = await client.chat.completions.create({
          model: mdl || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role as any, content: m.content })),
          ],
          max_tokens: maxTokens,
        });
        return {
          content: resp.choices[0].message.content || '',
          model: resp.model || mdl || 'llama-3.3-70b-versatile',
          tokens: {
            prompt: resp.usage?.prompt_tokens || 0,
            completion: resp.usage?.completion_tokens || 0,
            total: resp.usage?.total_tokens || 0,
          },
        };
      }
      case 'COHERE': {
        const { CohereClientV2 } = await import('cohere-ai');
        const client = new CohereClientV2({ token: key });
        const resp = await client.chat({
          model: mdl || 'command-r-plus-08-2024',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
              role: m.role === 'user' ? 'user' as const : 'assistant' as const,
              content: m.content,
            })),
          ],
          maxTokens,
        });
        const textContent = resp.message?.content?.[0];
        return {
          content: textContent?.type === 'text' ? textContent.text : '',
          model: (resp as any).model || mdl || 'command-r-plus-08-2024',
          tokens: {
            prompt: resp.usage?.tokens?.inputTokens || 0,
            completion: resp.usage?.tokens?.outputTokens || 0,
            total: (resp.usage?.tokens?.inputTokens || 0) + (resp.usage?.tokens?.outputTokens || 0),
          },
        };
      }
      default:
        throw new Error(`Unsupported AI provider: ${prov}. Supported: OPENAI, ANTHROPIC, GEMINI, GROQ, COHERE`);
    }
  };

  const normalizedProvider = provider.toUpperCase();
  if (isPlaceholder(rawKey) && normalizedProvider !== 'GROQ') {
    logger.warn(`[AI Router] Primary key for ${normalizedProvider} is placeholder. Falling back to GROQ model.`);
    const fallbackModel =
      normalizedProvider === 'OPENAI'
        ? 'llama-3.3-70b-versatile'
        : normalizedProvider === 'GEMINI'
        ? 'gemma2-9b-it'
        : normalizedProvider === 'ANTHROPIC'
        ? 'mixtral-8x7b-32768'
        : 'llama-3.1-8b-instant';
    const groqKey = process.env.GROQ_API_KEY || '';
    return executeProviderCall('GROQ', groqKey, fallbackModel);
  }

  try {
    return await executeProviderCall(normalizedProvider, rawKey, model);
  } catch (err: any) {
    logger.warn(`[AI Router] Direct call to ${normalizedProvider} failed: ${err.message}. Invoking GROQ fallback.`);
    if (normalizedProvider === 'GROQ') {
      throw err;
    }
    const fallbackModel =
      normalizedProvider === 'OPENAI'
        ? 'llama-3.3-70b-versatile'
        : normalizedProvider === 'GEMINI'
        ? 'gemma2-9b-it'
        : normalizedProvider === 'ANTHROPIC'
        ? 'mixtral-8x7b-32768'
        : 'llama-3.1-8b-instant';
    const groqKey = process.env.GROQ_API_KEY || '';
    return executeProviderCall('GROQ', groqKey, fallbackModel);
  }
};

export const calculateCost = (provider: string, tokens: { prompt: number; completion: number }) => {
  // Approximate costs per 1K tokens (USD)
  const rates: Record<string, { input: number; output: number }> = {
    OPENAI:    { input: 0.005,    output: 0.015 },
    ANTHROPIC: { input: 0.003,    output: 0.015 },
    GEMINI:    { input: 0.00025,  output: 0.0005 },
    GROQ:      { input: 0.0001,   output: 0.0001 },
    COHERE:    { input: 0.003,    output: 0.015 },
  };
  const rate = rates[provider.toUpperCase()] || { input: 0.001, output: 0.002 };
  return (tokens.prompt / 1000) * rate.input + (tokens.completion / 1000) * rate.output;
};
