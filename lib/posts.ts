import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";       // 解析 Markdown
import remarkGfm from "remark-gfm";          // 表格、任务列表、删除线
import remarkMath from "remark-math";         // 数学公式语法
import remarkRehype from "remark-rehype";     // Markdown AST → HTML AST
import rehypeKatex from "rehype-katex";       // 数学公式渲染
import rehypePrettyCode from "rehype-pretty-code"; // 代码高亮
import rehypeStringify from "rehype-stringify";    // HTML AST → 字符串
import readingTime from "reading-time";

// 把 reading-time 的英文输出转成中文
function formatReadingTime(text: string): string {
  // text 格式: "3 min read" 或 "1 min read" 或 "< 1 min read"
  const match = text.match(/(\d+)/);
  if (!match) return "不到 1 分钟";
  const mins = parseInt(match[1]);
  if (mins < 1) return "不到 1 分钟";
  if (mins < 60) return `${mins} 分钟`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours} 小时 ${remainMins} 分钟` : `${hours} 小时`;
}

// 支持的文件格式
const SUPPORTED_EXTENSIONS = [".md", ".mdx", ".txt"];
// 定义文章元数据的类型（不含正文）
export interface PostMeta {
  slug: string;          // URL 标识，如 "hello_world"
  title: string;         // 文章标题
  date: string;          // 发布日期
  excerpt: string;       // 摘要
  tags: string[];        // 标签数组
  readingTime: string;   // 阅读时间，如 "3 分钟"
}

// 定义完整文章的类型（含正文 HTML）
export interface Post extends PostMeta {
  contentHtml: string;   // 渲染后的 HTML 正文
}
// 文章目录的绝对路径,不同环境接不同的杠
const postsDirectory = path.join(process.cwd(), "posts");

/**
 * 获取所有文章的元数据（列表页用）
 * 支持两种结构：
 *   1. posts/hello_world.md → slug: hello_world
 *   2. posts/my-trip/index.md → slug: my-trip
 */
export function getAllPosts(): PostMeta[] {
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });
  const allPostsData: PostMeta[] = [];

  for (const entry of entries) {
    let filePath: string;
    let slug: string;

    if (entry.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      // 情况 1：顶层 .md 文件
      filePath = path.join(postsDirectory, entry.name);
      slug = entry.name.replace(/\.(md|mdx|txt)$/, "");
    } else if (entry.isDirectory()) {
      // 情况 2：文件夹内的 index.md
      const dirPath = path.join(postsDirectory, entry.name);
      const indexFile = findIndexFile(dirPath);
      if (!indexFile) continue;
      filePath = indexFile;
      slug = entry.name; // 文件夹名作为 slug
    } else {
      continue;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    const stats = readingTime(fileContents);

    allPostsData.push({
      slug,
      title: data.title ?? slug,
      date: data.date ?? new Date().toISOString().split("T")[0],
      excerpt: data.excerpt ?? "",
      tags: data.tags ?? [],
      readingTime: formatReadingTime(stats.text),
    });
  }

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// 在文件夹中查找 index.md / index.mdx / index.txt
function findIndexFile(dirPath: string): string | null {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const filePath = path.join(dirPath, `index${ext}`);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

/**
 * 获取所有 slug（Next.js 生成静态页面用）
 */
export function getAllSlugs(): string[] {
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });
  const slugs: string[] = [];

  for (const entry of entries) {
    if (entry.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      slugs.push(entry.name.replace(/\.(md|mdx|txt)$/, ""));
    } else if (entry.isDirectory()) {
      const dirPath = path.join(postsDirectory, entry.name);
      if (findIndexFile(dirPath)) slugs.push(entry.name);
    }
  }

  return slugs;
}

/**
 * 根据 slug 获取单篇文章完整数据（详情页用）
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // 尝试两种路径：
  // 1. posts/slug.md（平铺文件）
  // 2. posts/slug/index.md（文件夹文章）
  let fullPath = "";

  for (const ext of SUPPORTED_EXTENSIONS) {
    const flatPath = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(flatPath)) { fullPath = flatPath; break; }
  }

  if (!fullPath) {
    const dirPath = path.join(postsDirectory, slug);
    const indexFile = findIndexFile(dirPath);
    if (indexFile) fullPath = indexFile;
  }

  if (!fullPath) {
    throw new Error(`找不到文章: ${slug}`);
  }

  const ext = path.extname(fullPath).toLowerCase();
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const isPlainText = ext === ".txt";
  const data = isPlainText ? {} : matter(fileContents).data;
  const content = isPlainText ? fileContents : matter(fileContents).content;

  // 处理相对路径图片：./xxx.jpg → /api/posts-image/slug/xxx.jpg
  const processedContent = content.replace(
    /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
    `![$1](/api/posts-image/${slug}/$2)`
  );

  // 构建完整的 unified 处理管道
  // Markdown → remark 解析 → remark 插件 → remark-rehype → rehype 插件 → HTML 字符串
  const result = await unified()
    .use(remarkParse)                    // 1. 解析 Markdown 为 AST
    .use(remarkGfm)                      // 2. GFM：表格、任务列表、删除线
    .use(remarkMath)                     // 3. 数学公式语法识别
    .use(remarkRehype)                   // 4. Markdown AST → HTML AST
    .use(rehypeKatex)                    // 5. 数学公式渲染（KaTeX）
    .use(rehypePrettyCode, {             // 6. 代码语法高亮（Shiki）
      theme: "github-dark",
      keepBackground: false,
    })
    .use(rehypeStringify)                // 7. HTML AST → 字符串
    .process(processedContent);

  const contentHtml = result.toString();
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? new Date().toISOString().split("T")[0],
    excerpt: data.excerpt ?? (isPlainText ? content.slice(0, 120) + "..." : ""),
    tags: data.tags ?? [],
    readingTime: formatReadingTime(stats.text),
    contentHtml,
  };
}