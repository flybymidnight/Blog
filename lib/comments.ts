import fs from "fs";
import path from "path";

// 评论数据目录
const DATA_DIR = path.join(process.cwd(), "data");
const COMMENTS_FILE = path.join(DATA_DIR, "roast-board.json");

export interface Comment {
  id: string;
  content: string;        // 评论文字
  image?: string;         // 图片 URL（可选）
  author: string;         // 昵称
  createdAt: number;      // 时间戳
  parentId?: string;      // 回复的评论 ID（可选）
  x?: number;             // 漂浮位置 X（%）
  y?: number;             // 漂浮位置 Y（%）
  ip?: string;            // 评论者 IP
  location?: string;      // 大概位置（城市, 国家）
}

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取所有评论
export function getComments(): Comment[] {
  ensureDataDir();
  if (!fs.existsSync(COMMENTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(COMMENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 保存评论
export function saveComments(comments: Comment[]) {
  ensureDataDir();
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

// 添加评论
export function addComment(comment: Omit<Comment, "id" | "createdAt" | "x" | "y">): Comment {
  const comments = getComments();
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
    x: 5 + Math.random() * 80,
    y: 5 + Math.random() * 75,
  };
  comments.push(newComment);
  saveComments(comments);
  return newComment;
}
