import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "flybymidnight";
const REPO_NAME = "Blog";

// GET: 下载文件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "缺少文件路径" }, { status: 400 });
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "未配置 GITHUB_TOKEN" }, { status: 500 });
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // 获取文件内容
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
    });

    // 文件内容
    if (Array.isArray(data) || data.type !== "file") {
      return NextResponse.json({ error: "不是文件" }, { status: 400 });
    }

    // 下载文件内容（base64 解码）
    const fileData = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      mediaType: { format: "raw" },
    });

    // 返回文件流
    const content = fileData.data as unknown as ArrayBuffer;
    const fileName = filePath.split("/").pop() || "download";

    return new NextResponse(content, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "下载失败" },
      { status: 500 }
    );
  }
}
