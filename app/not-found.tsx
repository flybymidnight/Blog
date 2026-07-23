import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center">
        {/* 大号 404 */}
        <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800 select-none">
          404
        </h1>

        {/* 提示文字 */}
        <div className="-mt-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            页面走丢了
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            你要找的页面不存在，可能已经被删除或移动到了其他地方。
          </p>
        </div>

        {/* 返回按钮 */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            看看文章
          </Link>
        </div>

        {/* 装饰动画 */}
        <div className="mt-16 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
