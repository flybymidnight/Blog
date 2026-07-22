"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Comment {
  id: string;
  content: string;
  image?: string;
  author: string;
  createdAt: number;
  parentId?: string;
  x?: number;
  y?: number;
  location?: string;
}

export default function RoastBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [form, setForm] = useState({ author: "", content: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 加载评论
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error("加载评论失败", e);
    } finally {
      setLoading(false);
    }
  };

  // 管理员登录
  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) return;
    try {
      const res = await fetch("/api/drive/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (data.valid) setIsAdmin(true);
    } catch {}
  };

  // 删除评论
  const handleDeleteComment = async (id: string) => {
    if (!confirm("确定删除这条评论？")) return;
    try {
      await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: adminPassword }),
      });
      fetchComments();
      setSelectedId(null);
    } catch {}
  };

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      console.error("上传失败", err);
    } finally {
      setUploading(false);
    }
  };

  // 提交评论
  const handleSubmit = async () => {
    if (!form.content.trim()) return;
    const author = form.author.trim() || "匿名用户";
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          content: form.content,
          image: form.imageUrl || undefined,
          parentId: replyTo || undefined,
        }),
      });
      if (res.ok) {
        setForm({ author: form.author, content: "", imageUrl: "" });
        setReplyTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error("评论失败", err);
    }
  };

  // 获取顶级评论（非回复）
  const topLevel = comments.filter((c) => !c.parentId);
  // 获取某条评论的回复
  const getReplies = (id: string) => comments.filter((c) => c.parentId === id);

  const selected = comments.find((c) => c.id === selectedId);

  // 格式化时间
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-zinc-500 animate-pulse">加载中...</p>
      </div>
    );
  }

  return (
    <>
      {/* ===== 漂浮评论区 ===== */}
      <div className="relative w-full" style={{ height: "70vh", minHeight: 500 }}>
        {topLevel.map((comment) => (
          <motion.div
            key={comment.id}
            className="absolute cursor-pointer"
            style={{
              left: `${comment.x ?? 10}%`,
              top: `${comment.y ?? 10}%`,
              maxWidth: 200,
            }}
            // 漂浮动画
            animate={{
              x: [0, Math.random() * 20 - 10, Math.random() * 15 - 7, 0],
              y: [0, Math.random() * 15 - 7, Math.random() * 10 - 5, 0],
              rotate: [0, Math.random() * 4 - 2, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            onClick={() => setSelectedId(comment.id)}
          >
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-3 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow">
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                {comment.author || "💬"}
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3">
                {comment.content}
              </p>
              {comment.image && (
                <div className="mt-2 w-full h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                  <img
                    src={comment.image}
                    alt="评论图片"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {getReplies(comment.id).length > 0 && (
                <p className="text-xs text-zinc-400 mt-1">
                  💬 {getReplies(comment.id).length} 条回复
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {topLevel.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-400 text-lg">还没有吐槽，来第一个吧！</p>
          </div>
        )}
      </div>

      {/* ===== 选中评论的放大视图 ===== */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* 评论头部 */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {selected.author || "匿名吐槽"}
                    </h3>
                    <p className="text-xs text-zinc-400">{formatTime(selected.createdAt)} · {selected.location || "未知"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* 评论内容 */}
                <p className="text-zinc-800 dark:text-zinc-200 mb-4 whitespace-pre-wrap">
                  {selected.content}
                </p>
                {selected.image && (
                  <img
                    src={selected.image}
                    alt="评论图片"
                    className="rounded-xl max-w-full mb-4"
                  />
                )}

                {/* 回复列表 */}
                {getReplies(selected.id).length > 0 && (
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mb-4">
                    <h4 className="text-sm font-bold mb-3 text-zinc-500">回复</h4>
                    {getReplies(selected.id).map((reply) => (
                      <div key={reply.id} className="ml-4 mb-3 pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-bold text-purple-500">{reply.author || "匿名"}</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{reply.content}</p>
                        {reply.image && (
                          <img src={reply.image} alt="" className="rounded-lg mt-1 max-w-xs" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 回复按钮 + 管理员删除 */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setReplyTo(selected.id)}
                    className="text-sm text-purple-500 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    💬 回复这条吐槽
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(selected.id)}
                      className="text-sm text-red-400 hover:text-red-600"
                    >
                      🗑️ 删除
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 发表评论表单 ===== */}
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4">
          {replyTo ? "↩️ 回复吐槽" : "✏️ 发表吐槽"}
        </h3>
        {replyTo && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              回复: {comments.find((c) => c.id === replyTo)?.content?.slice(0, 30)}...
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              取消
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="你的昵称（可选，默认匿名）"
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          className="w-full mb-3 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          maxLength={20}
        />

        <textarea
          placeholder="说点什么吧..."
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="w-full mb-3 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          rows={3}
          maxLength={500}
        />

        {/* 图片上传 */}
        <div className="flex items-center gap-3 mb-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {uploading ? "上传中..." : "📷 添加图片"}
          </button>
          {form.imageUrl && (
            <div className="flex items-center gap-2">
              <img src={form.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <button
                onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                className="text-xs text-red-400"
              >
                删除
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.content.trim()}
          className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {replyTo ? "发送回复" : "发射吐槽 🚀"}
        </button>
      </div>

      {/* 管理员入口 */}
      <div className="max-w-2xl mx-auto mt-4 text-center">
        {isAdmin ? (
          <p className="text-xs text-zinc-400">🔑 管理员模式已开启（点击评论可删除）</p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <input
              type="password"
              placeholder="管理密码"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              className="px-3 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent w-32"
            />
            <button onClick={handleAdminLogin} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">🔑</button>
          </div>
        )}
      </div>
    </>
  );
}
