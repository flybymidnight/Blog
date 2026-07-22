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
let memoryCache: Comment[] = [];
let redisWorking: boolean | null = null; // null = 未检测

async function tryRedis(fn: () => Promise<any>) {
  if (redisWorking === false) return;
  try {
    await fn();
    redisWorking = true;
  } catch {
    redisWorking = false;
  }
}

export async function getComments(): Promise<Comment[]> {
  if (redisWorking !== false) {
    try {
      const data = await redis.get<Comment[]>(COMMENTS_KEY);
      if (data) { memoryCache = data; redisWorking = true; return data; }
    } catch { redisWorking = false; }
  }
  return memoryCache;
}

async function saveComments(comments: Comment[]) {
  memoryCache = comments;
  await tryRedis(() => redis.set(COMMENTS_KEY, JSON.stringify(comments)));
}

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

export async function deleteComment(id: string): Promise<boolean> {
  const comments = await getComments();
  const filtered = comments.filter((c) => c.id !== id);
  if (filtered.length === comments.length) return false;
  await saveComments(filtered);
  return true;
}
