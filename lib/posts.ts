import fs from "fs";//node.js中读写文件模块
import path from "path";//Node.js 内置模块，用来处理文件路径（拼接、解析）
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";
// 定义文章元数据的类型（不含正文）
export interface PostMeta {
  slug: string;          // URL 标识，如 "hello_world"
  title: string;         // 文章标题
  date: string;          // 发布日期
  excerpt: string;       // 摘要
  tags: string[];        // 标签数组
  readingTime: string;   // 阅读时间，如 "1 min read"
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
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      // 文件名 → slug（去掉 .md 后缀）
      const slug = fileName.replace(/\.md$/, "");

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
        readingTime: stats.text,
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
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

/**
 * 根据 slug 获取单篇文章完整数据（详情页用）
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  // 拼接文件路径
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  // 读取文件
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // 分离 frontmatter（data）和正文（content）
  const { data, content } = matter(fileContents);

  // 把 Markdown 正文转成 HTML
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // 计算阅读时间
  const stats = readingTime(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: data.tags || [],
    readingTime: stats.text,
    contentHtml,
  };
}