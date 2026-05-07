import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getModelById } from "@/lib/models";
import { buildSystemPrompt } from "@/lib/personaPrompt";
import { elizaRespond } from "@/lib/eliza";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequest {
  modelId: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

const ANTHROPIC_MODEL = "claude-haiku-4-5";

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { modelId, messages } = body;
  if (!modelId || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "modelId and messages required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const model = getModelById(modelId);
  if (!model) {
    return new Response(JSON.stringify({ error: "Unknown modelId" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ELIZA: handled fully client-side via lib/eliza.ts, but support a server
  // call too as a fallback (returns text/plain stream).
  if (model.mode === "eliza") {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const reply = elizaRespond(lastUser?.content ?? "");
    return streamPlainText(reply);
  }

  if (model.mode === "info-only") {
    return new Response(
      JSON.stringify({
        error: "This model is info-only and cannot chat.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(model);

  // Map our messages to Anthropic format
  const anthropicMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  if (anthropicMessages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = await client.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: model.maxTokens ?? 500,
      temperature: model.temperature ?? 0.7,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown Anthropic API error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function streamPlainText(text: string): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      // Tiny artificial delay to feel like streaming
      const chunks = text.split(/(\s+)/);
      for (const c of chunks) {
        controller.enqueue(encoder.encode(c));
        await new Promise((r) => setTimeout(r, 25));
      }
      controller.close();
    },
  });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
