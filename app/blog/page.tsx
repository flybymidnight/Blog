import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "博客",
  description: "所有文章",
};

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">所有文章</h1>
      <p className="text-zinc-500 mb-12">共 {posts.length} 篇</p>

      <div className="flex flex-col gap-10">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-xl font-semibold group-hover:underline underline-offset-4">
                {post.title}
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}