import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "posts");

// GET: /api/posts-image/slug/filename.jpg
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  try {
    const { slug, filename } = await params;
    const imagePath = path.join(POSTS_DIR, slug, filename);

    // 安全检查：防止路径穿越
    const resolvedPath = path.resolve(imagePath);
    if (!resolvedPath.startsWith(POSTS_DIR)) {
      return NextResponse.json({ error: "禁止访问" }, { status: 403 });
    }

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: "图片不存在" }, { status: 404 });
    }

    const buffer = fs.readFileSync(imagePath);
    const ext = path.extname(filename).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
      ".png": "image/png", ".gif": "image/gif",
      ".webp": "image/webp", ".avif": "image/avif",
      ".svg": "image/svg+xml",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}
