import { getPostBySlug, getAllSlugs } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import Giscus from "@/components/Giscus";

// 告诉 Next.js 构建时需要生成哪些页面
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// 为每篇文章生成独立的 SEO 元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-12">
        <Link
          href="/blog"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← 返回博客列表
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div
        className="prose prose-zinc dark:prose-invert max-w-none
          prose-headings:scroll-mt-20
          prose-a:text-blue-600 dark:prose-a:text-blue-400
          prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* ===== 评论区（Giscus） ===== */}
      <section className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-6">💬 评论</h2>
        <Giscus
          repo="flybymidnight/Blog"
          repoId="R_kgDOTd8Raw"
          category="Announcements"
          categoryId="DIC_kwDOTd8Ra84DBo5f"
          mapping="pathname"
          reactionsEnabled={true}
          inputPosition="bottom"
        />
      </section>

      <footer className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/blog"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← 返回博客列表
        </Link>
      </footer>
    </article>
  );
}