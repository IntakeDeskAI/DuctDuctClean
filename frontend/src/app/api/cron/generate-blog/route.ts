import { NextResponse } from "next/server";
import { generateBlogPost } from "@/lib/ai/generate-blog";
import { getAllPostSlugs, insertBlogPost } from "@/lib/supabase/blog";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingSlugs = await getAllPostSlugs();
    const post = await generateBlogPost(existingSlugs);

    // Ensure slug uniqueness
    if (existingSlugs.includes(post.slug)) {
      post.slug = `${post.slug}-${Date.now()}`;
    }

    await insertBlogPost({ ...post, generated_by_ai: true });

    return NextResponse.json({
      success: true,
      slug: post.slug,
      title: post.title,
    });
  } catch (error) {
    console.error("Blog generation failed:", error);
    return NextResponse.json(
      { error: "Blog generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
