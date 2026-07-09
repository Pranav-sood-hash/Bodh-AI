import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';
// @ts-ignore
import * as pdfParse from 'pdf-parse';

export const uploadDocument = asyncHandler(async (req, res) => {
  const file = req.file;
  const userId = req.user.id;

  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }

  let text = '';
  const fileType = file.mimetype;
  const originalName = file.originalname;

  if (fileType === 'application/pdf') {
    try {
      const parseFn = (pdfParse as any).default || pdfParse;
      const data = await parseFn(file.buffer);
      text = data.text || '';
    } catch (err: any) {
      throw new ApiError(400, `Failed to parse PDF document: ${err.message}`);
    }
  } else if (fileType.startsWith('text/') || originalName.endsWith('.txt') || originalName.endsWith('.md') || originalName.endsWith('.json') || originalName.endsWith('.js') || originalName.endsWith('.ts')) {
    text = file.buffer.toString('utf-8');
  } else {
    throw new ApiError(400, 'Unsupported file format. Please upload PDF, TXT, MD, JSON, JS, or TS files.');
  }

  if (!text || text.trim() === '') {
    throw new ApiError(400, 'Document contains no readable text');
  }

  // Chunking text: 1000 characters per chunk, with 200 characters overlap
  const chunkSize = 1000;
  const overlap = 200;
  const chunks: string[] = [];
  let index = 0;

  while (index < text.length) {
    const chunk = text.substring(index, index + chunkSize).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    index += chunkSize - overlap;
  }

  // Create KnowledgeDoc and DocChunks in DB
  const doc = await prisma.knowledgeDoc.create({
    data: {
      userId,
      title: originalName,
      fileUrl: '', // Locally parsed, url is empty
      fileType,
      totalChunks: chunks.length,
      extractedText: text,
      chunks: {
        create: chunks.map((content, chunkIndex) => ({
          content,
          chunkIndex,
        })),
      },
    },
  });

  return res.status(201).json(ApiResponse.success(doc, 'Document uploaded and indexed successfully'));
});

export const listDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const docs = await prisma.knowledgeDoc.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      fileType: true,
      totalChunks: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(ApiResponse.success(docs));
});

export const queryDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const { query } = req.body;
  const userId = req.user.id;

  if (!query || query.trim() === '') {
    throw new ApiError(400, 'Query is required');
  }

  const doc = await prisma.knowledgeDoc.findFirst({
    where: { id: docId, userId },
    include: { chunks: true },
  });

  if (!doc) {
    throw new ApiError(404, 'Document not found');
  }

  // Basic word frequency TF-IDF keyword overlap scoring for retrieval
  const queryWords = query.toLowerCase().split(/\W+/).filter((w: string) => w.length > 2);
  
  const scoredChunks = doc.chunks.map((chunk) => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    
    queryWords.forEach((word: string) => {
      // Direct substring match
      if (contentLower.includes(word)) {
        score += 1;
        // Boost score for multiple occurrences
        const occurrences = contentLower.split(word).length - 1;
        score += occurrences * 0.2;
      }
    });

    return { chunk, score };
  });

  // Sort by score descending and take top 4 chunks
  const topChunks = scoredChunks
    .filter((sc) => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((sc) => sc.chunk.content);

  // If no chunks match, fallback to first 2 chunks as basic context
  const contextChunks = topChunks.length > 0 ? topChunks : doc.chunks.slice(0, 2).map((c) => c.content);

  const contextText = contextChunks.join('\n\n---\n\n');

  // Call AI with context
  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let answer = 'AI service is unavailable';
  if (rawKey) {
    const prompt = `Use the following document segments extracted from "${doc.title}" to answer the student's question.
If the answer cannot be found in the document, answer using your general knowledge but clearly state that the document did not explicitly cover this point.

--- DOCUMENT EXTRACTS START ---
${contextText}
--- DOCUMENT EXTRACTS END ---

User's Question: "${query}"`;

    const aiResult = await callAI({
      provider: selectedProvider,
      rawKey,
      messages: [{ role: 'user', content: prompt }],
      mode: 'FREE_CHAT',
    });
    answer = aiResult.content;
  } else {
    answer = 'AI API key not configured. Matching text segments from the document:\n\n' + contextText;
  }

  return res.json(ApiResponse.success({
    query,
    answer,
    sources: contextChunks,
  }));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const userId = req.user.id;

  const doc = await prisma.knowledgeDoc.findFirst({
    where: { id: docId, userId },
  });

  if (!doc) {
    throw new ApiError(404, 'Document not found');
  }

  await prisma.knowledgeDoc.delete({
    where: { id: docId },
  });

  return res.json(ApiResponse.success(null, 'Document deleted successfully'));
});

export const getDocument = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const userId = req.user.id;

  const doc = await prisma.knowledgeDoc.findFirst({
    where: { id: docId, userId },
  });

  if (!doc) {
    throw new ApiError(404, 'Document not found');
  }

  return res.json(ApiResponse.success(doc));
});

export const createArticle = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    throw new ApiError(400, 'Title and content are required');
  }

  // Chunking text
  const chunkSize = 1000;
  const overlap = 200;
  const chunks: string[] = [];
  let index = 0;

  while (index < content.length) {
    const chunk = content.substring(index, index + chunkSize).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    index += chunkSize - overlap;
  }

  const doc = await prisma.knowledgeDoc.create({
    data: {
      userId,
      title,
      fileUrl: '',
      fileType: 'text/markdown',
      totalChunks: chunks.length,
      extractedText: content,
      chunks: {
        create: chunks.map((c, chunkIndex) => ({
          content: c,
          chunkIndex,
        })),
      },
    },
  });

  return res.status(201).json(ApiResponse.success(doc, 'Article created successfully'));
});

export const updateArticle = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    throw new ApiError(400, 'Title and content are required');
  }

  const doc = await prisma.knowledgeDoc.findFirst({
    where: { id: docId, userId },
  });

  if (!doc) {
    throw new ApiError(404, 'Article not found');
  }

  // Chunking new content
  const chunkSize = 1000;
  const overlap = 200;
  const chunks: string[] = [];
  let index = 0;

  while (index < content.length) {
    const chunk = content.substring(index, index + chunkSize).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    index += chunkSize - overlap;
  }

  // Transaction to update doc and recreate chunks
  const updatedDoc = await prisma.$transaction(async (tx) => {
    // Delete existing chunks
    await tx.docChunk.deleteMany({
      where: { docId },
    });

    // Update doc and create new chunks
    return tx.knowledgeDoc.update({
      where: { id: docId },
      data: {
        title,
        totalChunks: chunks.length,
        extractedText: content,
        chunks: {
          create: chunks.map((c, chunkIndex) => ({
            content: c,
            chunkIndex,
          })),
        },
      },
    });
  });

  return res.json(ApiResponse.success(updatedDoc, 'Article updated successfully'));
});
