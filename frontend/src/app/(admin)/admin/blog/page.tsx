import { getAllPostsAdmin } from "@/lib/supabase/blog";
import BlogPostsTable from "@/components/admin/BlogPostsTable";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Blog Posts
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage blog posts and generate new AI content
        </p>
      </div>

      <BlogPostsTable posts={posts} />
    </div>
  );
}
