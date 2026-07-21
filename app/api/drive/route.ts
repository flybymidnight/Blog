import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

// 从环境变量读取
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD;
const REPO_OWNER = "flybymidnight";
const REPO_NAME = "Blog";

function getOctokit() {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN 未配置");
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

// GET: 列出仓库中的文件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";

    const octokit = getOctokit();
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    });

    // 只返回文件和文件夹的基本信息
    const items = Array.isArray(data)
      ? data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type, // "file" 或 "dir"
          size: item.size,
          sha: item.sha,
        }))
      : [];

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "读取失败" },
      { status: 500 }
    );
  }
}

// POST: 上传文件到仓库（需要密码）
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const targetPath = formData.get("path") as string;
    const password = formData.get("password") as string;

    if (!file || !targetPath) {
      return NextResponse.json({ error: "缺少文件或路径" }, { status: 400 });
    }

    // 验证密码
    if (!UPLOAD_PASSWORD || password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: "密码错误，无上传权限" }, { status: 403 });
    }

    const octokit = getOctokit();

    // 读取文件内容为 base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString("base64");

    // 检查文件是否已存在（需要更新而非创建）
    let sha: string | undefined;
    try {
      const { data: existing } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: targetPath,
      });
      if (!Array.isArray(existing)) {
        sha = existing.sha;
      }
    } catch {
      // 文件不存在，正常创建
    }

    // 创建或更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: targetPath,
      message: `upload: ${file.name}`,
      content,
      ...(sha ? { sha } : {}),
    });

    return NextResponse.json({
      success: true,
      path: targetPath,
      url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${targetPath}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "上传失败" },
      { status: 500 }
    );
  }
}

// DELETE: 删除仓库中的文件（需要密码）
export async function DELETE(request: NextRequest) {
  try {
    const { path, sha, password } = await request.json();

    if (!path || !sha) {
      return NextResponse.json({ error: "缺少路径或 sha" }, { status: 400 });
    }

    // 验证密码
    if (!UPLOAD_PASSWORD || password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: "密码错误，无删除权限" }, { status: 403 });
    }

    const octokit = getOctokit();

    await octokit.repos.deleteFile({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `delete: ${path}`,
      sha,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "删除失败" },
      { status: 500 }
    );
  }
}
