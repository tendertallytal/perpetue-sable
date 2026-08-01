import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// An OpenAI-compatible LM Studio server, reached over a Cloudflare tunnel.
// Set LLM_BASE_URL / LLM_MODEL in .env.local to point somewhere else.
const BASE_URL =
  process.env.LLM_BASE_URL ??
  'https://jerusalem-asks-notebooks-maritime.trycloudflare.com/v1';
const MODEL =
  process.env.LLM_MODEL ?? 'qwen3.6-35b-a3b-uncensored-hauhaucs-aggressive';

// She thinks for twenty to forty seconds. Vercel's default serverless ceiling is
// ten, which would kill the request before she ever answers.
export const maxDuration = 60;

// Built per request: constructing the client at module scope breaks `next build`
// whenever the env isn't present.
function client() {
  return new OpenAI({
    // The tunnel rejects unauthenticated calls; the real key lives in .env.local
    // locally and in the host's environment settings when deployed.
    apiKey: process.env.LLM_API_KEY ?? 'missing-key',
    baseURL: BASE_URL,
    // The SDK's own retries would multiply an already slow call past the ceiling.
    maxRetries: 0,
  });
}

// Qwen keeps its thinking in a separate field, but leaves it inline when
// reasoning is configured differently. Either way the reader shouldn't see it.
function stripReasoning(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export async function POST(request: Request) {
  if (!process.env.LLM_API_KEY) {
    // Worth saying out loud: this is the failure you get on a fresh deploy,
    // because .env.local never leaves the machine it was written on.
    console.error('LLM_API_KEY is not set in this environment.');
    return NextResponse.json(
      { error: 'LLM_API_KEY is not set in this environment' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    const completion = await client().chat.completions.create({
      model: MODEL,
      messages,
      stream: false,
    });

    const message = completion.choices[0].message;

    return NextResponse.json({
      role: message.role,
      content: stripReasoning(message.content ?? ''),
    });
  } catch (error) {
    // Surface enough to tell the three failure modes apart in the host's logs:
    // a rejected key, a tunnel that has moved, and a model that ran too long.
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status?: number }).status
        : undefined;
    console.error('Chat completion failed', {
      status,
      baseUrl: BASE_URL,
      model: MODEL,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to process your request', upstreamStatus: status ?? null },
      { status: 500 }
    );
  }
}
