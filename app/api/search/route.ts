import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

// 简单的模糊匹配：标题、摘要、标签中包含关键词即命中
function fuzzyMatch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [], query: "" });
  }

  const posts = getAllPosts();
  const results = posts
    .filter(
      (post) =>
        fuzzyMatch(post.title, q) ||
        fuzzyMatch(post.excerpt, q) ||
        post.tags.some((tag) => fuzzyMatch(tag, q))
    )
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      tags: post.tags,
      readingTime: post.readingTime,
    }));

  return NextResponse.json({ results, query: q });
}
