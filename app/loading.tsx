export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 旋转圆环 */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-600 dark:border-t-zinc-300 animate-spin" />
        </div>
        <span className="text-sm text-zinc-400">加载中...</span>
      </div>
    </div>
  );
}
