import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost, BlogSection } from "@/types";

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  read_time: number;
  meta_description: string;
  keywords: string[];
  sections: BlogSection[];
  status: string;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    publishedAt: row.published_at,
    readTime: row.read_time,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    sections: row.sections,
  };
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllPublishedPosts error:", error);
    return [];
  }
  return (data as BlogPostRow[]).map(mapRowToPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return mapRowToPost(data as BlogPostRow);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("getAllPostSlugs error:", error);
    return [];
  }
  return (data || []).map((row: { slug: string }) => row.slug);
}

export async function insertBlogPost(
  post: BlogPost & { generated_by_ai?: boolean }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_posts").insert({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    published_at: post.publishedAt,
    read_time: post.readTime,
    meta_description: post.metaDescription,
    keywords: post.keywords,
    sections: post.sections,
    status: "published",
    generated_by_ai: post.generated_by_ai ?? false,
  });

  if (error) throw error;
}

export async function getAllPostsAdmin(): Promise<
  (BlogPost & { id: string; status: string; generated_by_ai: boolean })[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllPostsAdmin error:", error);
    return [];
  }
  return (data as BlogPostRow[]).map((row) => ({
    ...mapRowToPost(row),
    id: row.id,
    status: row.status,
    generated_by_ai: row.generated_by_ai,
  }));
}

export async function updatePostStatus(
  id: string,
  status: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}
