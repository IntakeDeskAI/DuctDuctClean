import { chatRequestSchema } from "@/lib/validations/chat";
import { streamChatCompletion } from "@/lib/ai/provider";
import { CUSTOMER_CHAT_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(parsed.error.errors[0].message, { status: 400 });
    }

    const stream = await streamChatCompletion({
      messages: [
        { role: "system", content: CUSTOMER_CHAT_PROMPT },
        ...parsed.data.messages,
      ],
      model: "chat",
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
}
