import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { BlogPost } from "@/types";
import { GENERATE_BLOG_POST_PROMPT } from "@/lib/ai/prompts";

const BlogSectionSchema = z.object({
  heading: z.string().optional(),
  content: z.string(),
  list: z.array(z.string()).optional(),
});

const BlogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  readTime: z.number(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  sections: z.array(BlogSectionSchema),
});

function getProvider() {
  return process.env.AI_PROVIDER || "openai";
}

function getModel() {
  return process.env.AI_ADMIN_MODEL || "gpt-4o";
}

async function callOpenAI(prompt: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: "Generate the blog post now. Return only valid JSON." },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content || "";
}

async function callAnthropic(prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: getModel(),
    max_tokens: 4096,
    system: prompt,
    messages: [
      { role: "user", content: "Generate the blog post now. Return only valid JSON." },
    ],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function generateBlogPost(
  existingSlugs: string[]
): Promise<BlogPost> {
  const prompt = GENERATE_BLOG_POST_PROMPT(existingSlugs);
  const provider = getProvider();

  let rawJson: string;
  let lastError: unknown;

  // Try up to 2 times
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      rawJson =
        provider === "anthropic"
          ? await callAnthropic(prompt)
          : await callOpenAI(prompt);

      // Strip potential markdown fences
      rawJson = rawJson.replace(/^```json?\n?/g, "").replace(/\n?```$/g, "").trim();

      const parsed = JSON.parse(rawJson);
      return BlogPostSchema.parse(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
