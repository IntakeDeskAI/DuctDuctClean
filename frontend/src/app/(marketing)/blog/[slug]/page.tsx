import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs } from "@/data/blog-posts";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      {/* Header */}
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-brand-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <span className="inline-block rounded-full bg-brand-700 px-3 py-1 text-xs font-medium text-brand-200 mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-brand-300">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="prose prose-gray max-w-none">
            {post.sections.map((section, i) => (
              <div key={i} className="mb-8">
                {section.heading && (
                  <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
                    {section.heading}
                  </h2>
                )}
                <p className="text-gray-600 leading-relaxed mb-4">
                  {section.content}
                </p>
                {section.list && (
                  <ul className="space-y-2 mb-4">
                    {section.list.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-gray-600"
                      >
                        <span className="text-brand-500 mt-1 flex-shrink-0">
                          &#8226;
                        </span>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </article>

          {/* CTA */}
          <div className="mt-12 bg-brand-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold font-display text-gray-900 mb-2">
              Need Professional Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Schedule a free inspection with DuctDuctClean today.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Get a Free Quote
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-6">
                Related Articles
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs font-medium text-brand-600">
                      {related.category}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 mt-1 group-hover:text-brand-600 transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
