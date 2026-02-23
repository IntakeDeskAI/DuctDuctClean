import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAllPostsAdmin, updatePostStatus } from "@/lib/supabase/blog";
import { generateBlogPost } from "@/lib/ai/generate-blog";
import { getAllPostSlugs, insertBlogPost } from "@/lib/supabase/blog";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await getAllPostsAdmin();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === "generate") {
      const existingSlugs = await getAllPostSlugs();
      const post = await generateBlogPost(existingSlugs);

      if (existingSlugs.includes(post.slug)) {
        post.slug = `${post.slug}-${Date.now()}`;
      }

      await insertBlogPost({ ...post, generated_by_ai: true });

      return NextResponse.json({
        success: true,
        slug: post.slug,
        title: post.title,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    await updatePostStatus(id, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
