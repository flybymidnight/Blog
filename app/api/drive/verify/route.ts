import { NextRequest, NextResponse } from "next/server";

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD;

// POST: 验证密码
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!UPLOAD_PASSWORD) {
      return NextResponse.json({ error: "未配置上传密码" }, { status: 500 });
    }

    if (password === UPLOAD_PASSWORD) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false, error: "密码错误" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}
