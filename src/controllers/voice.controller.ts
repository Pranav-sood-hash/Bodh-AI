import { ElevenLabsClient } from 'elevenlabs';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { VOICES } from '../config/voices';

async function streamTTS(
  params: {
    text: string;
    voiceId?: string;
    speed?: number;
    stability?: number;
    similarityBoost?: number;
  },
  res: any
) {
  const { text, voiceId, speed = 1.0, stability = 0.5, similarityBoost = 0.75 } = params;

  if (!text || text.length === 0) {
    throw new ApiError(400, 'No text provided');
  }

  // Clean text: remove markdown symbols
  const cleanText = text
    .replace(/#{1,6}\s/g, '')     // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')   // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*[-*+]\s/gm, '')  // bullets
    .replace(/^\s*\d+\.\s/gm, '')  // numbers
    .replace(/\n{2,}/g, '. ')      // newlines
    .trim()
    .slice(0, 1000); // Limit to 1000 chars

  if (!process.env.ELEVENLABS_API_KEY) {
    throw new ApiError(503, 'Voice service not configured');
  }

  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
  });

  const selectedVoiceId = voiceId || VOICES.elevenlabs.aria.id;

  // Generate audio stream
  const audioStream = await client.generate({
    voice: selectedVoiceId,
    text: cleanText,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability,
      similarity_boost: similarityBoost,
      speed
    }
  });

  // Set audio headers
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Stream audio to client
  for await (const chunk of audioStream) {
    res.write(chunk);
  }
  res.end();
}

export const textToSpeech = asyncHandler(async (req, res) => {
  const { text, voiceId, speed, stability, similarityBoost } = req.body;
  await streamTTS({ text, voiceId, speed, stability, similarityBoost }, res);
});

export const previewVoice = asyncHandler(async (req, res) => {
  const { voiceId, voiceName } = req.body;

  const preview = Object.values(VOICES.elevenlabs).find(
    (v: any) => v.id === voiceId
  )?.preview || `Hello! I am ${voiceName || 'your assistant'}.`;

  await streamTTS({ text: preview, voiceId }, res);
});
