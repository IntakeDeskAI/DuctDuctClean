"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Bot } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";

interface AdminBlogPost extends BlogPost {
  id: string;
  status: string;
  generated_by_ai: boolean;
}

interface BlogPostsTableProps {
  posts: AdminBlogPost[];
}

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function BlogPostsTable({ posts }: BlogPostsTableProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.details || data.error || "Generation failed");
      }
    } catch (err) {
      setError(String(err));
    }
    setGenerating(false);
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    }
    setUpdating(null);
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate New Post"}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Title
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Category
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {post.title}
                    </span>
                    {post.generated_by_ai && (
                      <Bot className="h-4 w-4 text-brand-500 flex-shrink-0" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {post.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(post.publishedAt)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      statusColors[post.status] || statusColors.draft
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {post.status !== "published" && (
                      <button
                        onClick={() =>
                          handleStatusChange(post.id, "published")
                        }
                        disabled={updating === post.id}
                        className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                      >
                        Publish
                      </button>
                    )}
                    {post.status === "published" && (
                      <button
                        onClick={() => handleStatusChange(post.id, "draft")}
                        disabled={updating === post.id}
                        className="text-xs text-yellow-600 hover:text-yellow-800 font-medium disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    )}
                    {post.status !== "archived" && (
                      <button
                        onClick={() =>
                          handleStatusChange(post.id, "archived")
                        }
                        disabled={updating === post.id}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No blog posts yet. Click &quot;Generate New Post&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
