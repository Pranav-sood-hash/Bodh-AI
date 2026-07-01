import dotenv from 'dotenv';
dotenv.config();

import prisma from './src/config/db';
import { callAI } from './src/services/ai/ai.router.service';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'agenttest_1@gmail.com' }
  });
  if (!user) throw new Error("User not found");

  const chat = await prisma.chat.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  if (!chat) throw new Error("Chat not found");

  console.log("Found user:", user.email);
  console.log("Found chat ID:", chat.id);
  console.log("Chat mode:", chat.mode);

  const content = "Hello! Tell me a 1-sentence joke about computers.";

  // Simulate sendMessage logic:
  // Get history
  const history = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { role: true, content: true }
  });

  const messages = history.map(m => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));

  // Add the message that we want to send
  messages.push({ role: 'user', content });

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  console.log("selectedProvider:", selectedProvider);
  console.log("rawKey defined?", !!rawKey);

  try {
    const aiResult = await callAI({
      provider: selectedProvider,
      rawKey: rawKey || '',
      messages,
      mode: chat.mode,
    });
    console.log("SUCCESS! Result:", JSON.stringify(aiResult, null, 2));
  } catch (err: any) {
    console.error("FAILED! Error details:");
    console.error(err);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
