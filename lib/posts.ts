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
 * 返回按日期倒序排列的文章数组
 */
export function getAllPosts(): PostMeta[] {
  // 1. 读取 posts/ 目录下所有文件名
  const fileNames = fs.readdirSync(postsDirectory);

  // 2. 过滤出 .md 文件，逐个解析
  const allPostsData = fileNames
    .filter((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    })
    .map((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      const slug = fileName.replace(/\.(md|mdx|txt)$/, "");

      // 读取文件完整内容
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // 解析 frontmatter（只取元数据，不取正文）
      const { data } = matter(fileContents);

      // 计算阅读时间
      const stats = readingTime(fileContents);

      // 组装成 PostMeta 对象
      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        tags: data.tags || [],  // 如果没写 tags，返回空数组
        readingTime: formatReadingTime(stats.text),
      };
    });

  // 3. 按日期倒序排列（最新文章在前）
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 获取所有 slug（Next.js 生成静态页面用）
 */
export function getAllSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    })
    .map((fileName) => fileName.replace(/\.(md|mdx|txt)$/, ""));
}

/**
 * 根据 slug 获取单篇文章完整数据（详情页用）
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // 尝试按优先级查找文件：.md > .mdx > .txt
  let fullPath = "";
  for (const ext of SUPPORTED_EXTENSIONS) {
    const testPath = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(testPath)) {
      fullPath = testPath;
      break;
    }
  }
  if (!fullPath) {
    throw new Error(`找不到文章: ${slug}`);
  }

  const ext = path.extname(fullPath).toLowerCase();
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // 纯文本文件不需要解析 frontmatter
  const isPlainText = ext === ".txt";
  const data = isPlainText ? {} : matter(fileContents).data;
  const content = isPlainText ? fileContents : matter(fileContents).content;

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
    .process(content);

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