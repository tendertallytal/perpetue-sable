import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// An OpenAI-compatible LM Studio server, reached over a Cloudflare tunnel.
// Set LLM_BASE_URL / LLM_MODEL in .env.local to point somewhere else.
const BASE_URL =
  process.env.LLM_BASE_URL ??
  'https://jerusalem-asks-notebooks-maritime.trycloudflare.com/v1';
const MODEL =
  process.env.LLM_MODEL ?? 'qwen3.6-35b-a3b-uncensored-hauhaucs-aggressive';

// Built per request: constructing the client at module scope breaks `next build`
// whenever the env isn't present.
function client() {
  return new OpenAI({
    // The tunnel rejects unauthenticated calls; the real key lives in .env.local.
    apiKey: process.env.LLM_API_KEY ?? 'missing-key',
    baseURL: BASE_URL,
  });
}

// Qwen keeps its thinking in a separate field, but leaves it inline when
// reasoning is configured differently. Either way the reader shouldn't see it.
function stripReasoning(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export async function POST(request: Request) {
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
    console.error('Chat completion error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
