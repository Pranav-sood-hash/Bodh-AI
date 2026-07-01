import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleChat } from "./chat";
import { Request, Response } from "express";

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("handleChat handler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  let statusNumber: number | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GROQ_API_KEY", "test-env-api-key");
    
    statusNumber = null;
    responseData = null;

    mockResponse = {
      status: vi.fn().mockImplementation((code) => {
        statusNumber = code;
        return mockResponse as Response;
      }),
      json: vi.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse as Response;
      }),
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return 400 when required fields are missing", async () => {
    mockRequest = {
      body: {
        messages: [],
        // model and system_prompt are missing
      },
    };

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(statusNumber).toBe(400);
    expect(responseData).toEqual({
      error: "Missing required fields: messages, model, system_prompt",
    });
  });

  it("should return 401 if GROQ_API_KEY is not configured", async () => {
    vi.stubEnv("GROQ_API_KEY", ""); // Clear the env var

    mockRequest = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3-8b",
        system_prompt: "You are a helpful assistant",
      },
    };

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(statusNumber).toBe(401);
    expect(responseData).toEqual({
      error: "GROQ_API_KEY not configured. Please set your API key in Settings.",
    });
  });

  it("should use client-provided API key if available", async () => {
    mockRequest = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3-8b",
        system_prompt: "You are a helpful assistant",
        apiKey: "client-key-override",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Hello from mock AI!",
            },
          },
        ],
      }),
    });

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer client-key-override",
        }),
      })
    );
    expect(responseData).toEqual({ message: "Hello from mock AI!" });
  });

  it("should return successful response on correct format", async () => {
    mockRequest = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3-8b",
        system_prompt: "You are a helpful assistant",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Hello back!",
            },
          },
        ],
      }),
    });

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(responseData).toEqual({ message: "Hello back!" });
  });

  it("should propagate errors from Groq API", async () => {
    mockRequest = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3-8b",
        system_prompt: "You are a helpful assistant",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: "Rate limit exceeded" },
      }),
    });

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(statusNumber).toBe(429);
    expect(responseData).toEqual({
      error: { message: "Rate limit exceeded" },
    });
  });

  it("should return 500 when fetch throws an error", async () => {
    mockRequest = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3-8b",
        system_prompt: "You are a helpful assistant",
      },
    };

    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    await handleChat(mockRequest as Request, mockResponse as Response, () => {});

    expect(statusNumber).toBe(500);
    expect(responseData).toEqual({
      error: "Failed to process chat request: Network failure",
    });
  });
});
