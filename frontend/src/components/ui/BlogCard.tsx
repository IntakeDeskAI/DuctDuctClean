import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
        <span className="text-sm font-semibold text-brand-600 bg-white/80 px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} min read
          </span>
        </div>
        <h3 className="text-lg font-bold font-display text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
          Read More <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
