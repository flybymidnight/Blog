import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/comments";

// 从请求头获取 IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// 根据 IP 获取大概位置（使用免费 API）
async function getLocation(ip: string): Promise<string> {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return "本地";
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
      signal: AbortSignal.timeout(3000), // 3 秒超时
    });
    const data = await res.json();
    if (data.status === "success") {
      return `${data.city ?? ""}, ${data.country ?? ""}`.trim().replace(/^,|,$/, "");
    }
  } catch {
    // 查询失败不影响评论提交
  }
  return "未知";
}

// GET: 获取所有评论（隐藏 IP 和精确位置，只返回城市）
export async function GET() {
  const comments = getComments();
  // 返回时隐藏 IP，只保留城市信息
  const safe = comments.map(({ ip, ...rest }) => rest);
  return NextResponse.json(safe);
}

// POST: 添加新评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, image, author, parentId } = body;

    if (!content) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const location = await getLocation(ip);

    const comment = addComment({
      content: content.slice(0, 500),
      image: image?.slice(0, 2000),
      author: (author || "匿名用户").slice(0, 20),
      parentId,
      ip,
      location,
    });

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
