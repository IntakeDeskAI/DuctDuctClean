import type { Metadata } from "next";
import { getAllPublishedPosts } from "@/lib/supabase/blog";
import BlogCard from "@/components/ui/BlogCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips and guides on air duct cleaning, indoor air quality, HVAC maintenance, and home safety from the DuctDuctClean team in Idaho Falls, ID.",
};

export default async function BlogPage() {
  const posts = await getAllPublishedPosts();

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-2">
            Our Blog
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white">
            Air Quality Tips &amp; Guides
          </h1>
          <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
            Expert advice on keeping your home&apos;s air clean, your HVAC
            system efficient, and your family safe.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
