"use client";

import { useState, useEffect, useRef } from "react";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
}

export default function CloudDrive() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 加载文件列表
  const loadFiles = async (path: string = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/drive?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setFiles([]);
      } else {
        setFiles(data);
        setCurrentPath(path);
      }
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setError("");

    for (const file of Array.from(fileList)) {
      const targetPath = currentPath
        ? `${currentPath}/${file.name}`
        : `public/uploads/${file.name}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", targetPath);
      formData.append("password", password);

      try {
        const res = await fetch("/api/drive", { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) {
          setError(`上传 ${file.name} 失败: ${data.error}`);
        }
      } catch {
        setError(`上传 ${file.name} 失败`);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    loadFiles(currentPath);
  };

  // 下载文件
  const handleDownload = async (file: { name: string; path: string }) => {
    try {
      // 通过 GitHub API 获取文件内容
      const res = await fetch(`/api/drive/download?path=${encodeURIComponent(file.path)}`);
      if (!res.ok) {
        setError("下载失败");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("下载失败");
    }
  };

  // 删除文件
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch("/api/drive", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: deleteTarget.path, sha: deleteTarget.sha, password }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else loadFiles(currentPath);
    } catch { setError("删除失败"); }
    setDeleteTarget(null);
  };

  // 进入文件夹
  const enterDir = (path: string) => {
    loadFiles(path);
  };

  // 返回上级
  const goBack = () => {
    const parts = currentPath.split("/");
    parts.pop();
    loadFiles(parts.join("/"));
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // 文件图标
  const getFileIcon = (item: FileItem) => {
    if (item.type === "dir") return "📁";
    const ext = item.name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext!)) return "🖼️";
    if (["mp4", "webm", "mov", "avi"].includes(ext!)) return "🎬";
    if (["mp3", "m4a", "wav", "aac"].includes(ext!)) return "🎵";
    if (["md", "txt", "doc"].includes(ext!)) return "📝";
    return "📄";
  };

  // 验证密码
  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/drive/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsLoggedIn(true);
        setShowLogin(false);
        setLoginError("");
      } else {
        setLoginError("密码错误，请重试");
      }
    } catch {
      setLoginError("验证失败，请重试");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      {/* 密码验证弹窗 */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowLogin(false); setLoginError(""); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">🔐 验证身份</h3>
            <p className="text-sm text-zinc-500 mb-4">输入管理员密码以获得上传和删除权限</p>
            <input
              type="password" placeholder="输入密码" value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
              onKeyDown={(e) => e.key === "Enter" && !loginLoading && handleLogin()}
              className="w-full mb-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
            {loginError && <p className="text-sm text-red-500 mb-3">{loginError}</p>}
            {!loginError && <div className="mb-3" />}
            <div className="flex gap-2">
              <button onClick={() => { setShowLogin(false); setLoginError(""); }} className="flex-1 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">取消</button>
              <button onClick={handleLogin} disabled={loginLoading} className="flex-1 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50">{loginLoading ? "验证中..." : "确认"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">🗑️ 确认删除</h3>
            <p className="text-sm text-zinc-500 mb-6">确定要删除 <span className="font-medium text-zinc-800 dark:text-zinc-200">{deleteTarget.name}</span>？</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">取消</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">删除</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 原有的文件管理界面 ===== */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <button
            onClick={() => loadFiles("")}
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            根目录
          </button>
          {currentPath.split("/").filter(Boolean).map((part, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              <span>/</span>
              <button
                onClick={() => loadFiles(arr.slice(0, i + 1).join("/"))}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {currentPath && (
            <button
              onClick={goBack}
              className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              ← 返回
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          {isLoggedIn ? (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {uploading ? "上传中..." : "📤 上传文件"}
              </button>
              <button
                onClick={() => { setIsLoggedIn(false); setPassword(""); }}
                className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                🔒 退出管理
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              🔐 管理员登录
            </button>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 文件列表 */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400 animate-pulse">加载中...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">空目录</div>
      ) : (
        <div className="grid gap-2">
          {files
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((item) => (
              <div
                key={item.path}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <button
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                  onClick={() => item.type === "dir" ? enterDir(item.path) : null}
                >
                  <span className="text-xl">{getFileIcon(item)}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.type === "file" && (
                      <p className="text-xs text-zinc-400">{formatSize(item.size)}</p>
                    )}
                  </div>
                </button>

                {/* 操作按钮 */}
                {item.type === "file" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(item)}
                      className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 text-sm px-2 py-1 transition-all"
                      title="下载"
                    >
                      ⬇
                    </button>
                    {isLoggedIn && (
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm px-2 py-1 transition-all"
                        title="删除"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
