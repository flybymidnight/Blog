import redis from "./redis";

export interface Comment {
  id: string;
  content: string;
  image?: string;
  author: string;
  createdAt: number;
  parentId?: string;
  x?: number;
  y?: number;
  ip?: string;
  location?: string;
}

const COMMENTS_KEY = "blog:roast:comments";

// 内存缓存（Redis 不可用时的 fallback）
let memoryCache: Comment[] | null = null;

// 检查 Redis 是否可用
async function isRedisAvailable(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// 读取所有评论
export async function getComments(): Promise<Comment[]> {
  try {
    if (await isRedisAvailable()) {
      const data = await redis.get<Comment[]>(COMMENTS_KEY);
      memoryCache = data || [];
      return memoryCache;
    }
  } catch {}
  return memoryCache || [];
}

// 保存评论
async function saveComments(comments: Comment[]) {
  memoryCache = comments;
  try {
    if (await isRedisAvailable()) {
      await redis.set(COMMENTS_KEY, JSON.stringify(comments));
    }
  } catch {}
}

// 添加评论
export async function addComment(comment: Omit<Comment, "id" | "createdAt" | "x" | "y">): Promise<Comment> {
  const comments = await getComments();
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
    x: 5 + Math.random() * 80,
    y: 5 + Math.random() * 75,
  };
  comments.push(newComment);
  await saveComments(comments);
  return newComment;
}

// 删除评论
export async function deleteComment(id: string): Promise<boolean> {
  const comments = await getComments();
  const filtered = comments.filter((c) => c.id !== id);
  if (filtered.length === comments.length) return false;
  await saveComments(filtered);
  return true;
}
