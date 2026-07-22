import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment, deleteComment } from "@/lib/comments";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

async function getLocation(ip: string): Promise<string> {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return "本地";
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.status === "success") return `${data.city ?? ""}, ${data.country ?? ""}`.trim().replace(/^,|,$/, "");
  } catch {}
  return "未知";
}

// GET: 获取所有评论
export async function GET() {
  const comments = await getComments();
  const safe = comments.map(({ ip, ...rest }) => rest);
  return NextResponse.json(safe);
}

// POST: 添加新评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, image, author, parentId } = body;
    if (!content) return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    const ip = getClientIp(request);
    const location = await getLocation(ip);
    const comment = await addComment({
      content: content.slice(0, 500),
      image: image?.slice(0, 2000),
      author: (author || "").slice(0, 20),
      parentId,
      ip,
      location,
    });
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}

// DELETE: 删除评论（管理后台用）
export async function DELETE(request: NextRequest) {
  try {
    const { id, password } = await request.json();
    if (password !== process.env.UPLOAD_PASSWORD) {
      return NextResponse.json({ error: "密码错误" }, { status: 403 });
    }
    const success = await deleteComment(id);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
