import fs from "fs";
import path from "path";
import { getAllPosts } from "@/lib/posts";
import { getGalleryImages } from "@/lib/gallery";
import { getVideos } from "@/lib/video";
import { getMusicFiles } from "@/lib/music";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "统计",
  description: "数据",
};

// 计算博客运行天数（从第一篇文章算起）
function getRunningDays(posts: { date: string }[]): number {
  if (posts.length === 0) return 0;
  const dates = posts.map((p) => new Date(p.date).getTime());
  const earliest = Math.min(...dates);
  const now = Date.now();
  return Math.max(1, Math.floor((now - earliest) / (1000 * 60 * 60 * 24)));
}

// 统计所有文章的总字数
function getTotalWords(): number {
  const postsDir = path.join(process.cwd(), "posts");
  if (!fs.existsSync(postsDir)) return 0;

  let total = 0;
  const entries = fs.readdirSync(postsDir, { withFileTypes: true });

  for (const entry of entries) {
    let filePath: string;
    if (entry.isFile() && /\.(md|mdx|txt)$/i.test(entry.name)) {
      filePath = path.join(postsDir, entry.name);
    } else if (entry.isDirectory()) {
      const dirPath = path.join(postsDir, entry.name);
      const indexFile = ["index.md", "index.mdx", "index.txt"]
        .map((f) => path.join(dirPath, f))
        .find((f) => fs.existsSync(f));
      if (!indexFile) continue;
      filePath = indexFile;
    } else {
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    // 去掉 frontmatter 后统计
    const body = content.replace(/^---[\s\S]*?---\n?/, "");
    total += body.replace(/\s/g, "").length;
  }
  return total;
}

// 统计标签分布
function getTagStats(posts: { tags: string[] }[]): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// 统计文章按年月分布
function getMonthlyStats(posts: { date: string }[]): { month: string; count: number }[] {
  const monthMap = new Map<string, number>();
  for (const post of posts) {
    const d = new Date(post.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  return Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// 数字格式化
function formatNum(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function StatsPage() {
  const posts = getAllPosts();
  const galleryCount = getGalleryImages().length;
  const videoCount = getVideos().length;
  const musicCount = getMusicFiles().length;
  const runningDays = getRunningDays(posts);
  const totalWords = getTotalWords();
  const tagStats = getTagStats(posts);
  const monthlyStats = getMonthlyStats(posts);
  const maxMonthly = Math.max(...monthlyStats.map((m) => m.count), 1);

  const statCards = [
    { label: "文章", value: posts.length, unit: "篇", color: "from-blue-500 to-cyan-500" },
    { label: "总字数", value: formatNum(totalWords), unit: "字", color: "from-purple-500 to-pink-500" },
    { label: "相册", value: galleryCount, unit: "张", color: "from-amber-500 to-orange-500" },
    { label: "视频", value: videoCount, unit: "个", color: "from-red-500 to-rose-500" },
    { label: "音乐", value: musicCount, unit: "首", color: "from-green-500 to-emerald-500" },
    { label: "标签", value: tagStats.length, unit: "个", color: "from-indigo-500 to-violet-500" },
    { label: "运行", value: runningDays, unit: "天", color: "from-teal-500 to-cyan-500" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">统计</h1>
      <p className="text-zinc-500 mb-10">数据</p>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div
              className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-10 -translate-y-1/3 translate-x-1/3`}
            />
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {card.value}
              <span className="text-sm font-normal text-zinc-400 ml-1">{card.unit}</span>
            </div>
            <div className="mt-1 text-sm text-zinc-500">{card.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
