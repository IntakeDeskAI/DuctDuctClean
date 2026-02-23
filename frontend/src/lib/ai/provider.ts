import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamOptions {
  messages: ChatMessage[];
  model?: "chat" | "admin";
}

function getProvider() {
  return process.env.AI_PROVIDER || "openai";
}

function getModel(tier: "chat" | "admin") {
  if (tier === "chat") {
    return process.env.AI_CHAT_MODEL || "gpt-4o-mini";
  }
  return process.env.AI_ADMIN_MODEL || "gpt-4o";
}

export async function streamChatCompletion({
  messages,
  model = "chat",
}: StreamOptions): Promise<ReadableStream<string>> {
  const provider = getProvider();
  const modelId = getModel(model);

  if (provider === "anthropic") {
    return streamAnthropic(messages, modelId);
  }
  return streamOpenAI(messages, modelId);
}

async function streamOpenAI(
  messages: ChatMessage[],
  model: string
): Promise<ReadableStream<string>> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });
}

async function streamAnthropic(
  messages: ChatMessage[],
  model: string
): Promise<ReadableStream<string>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemMessage = messages.find((m) => m.role === "system")?.content || "";
  const nonSystemMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    system: systemMessage,
    messages: nonSystemMessages,
  });

  return new ReadableStream<string>({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(event.delta.text);
        }
      }
      controller.close();
    },
  });
}
