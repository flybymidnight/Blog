"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免服务端渲染不匹配（next-themes 在 SSR 时不知道当前主题）
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // 占位：保持布局稳定
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === "dark";

  const handleClick = () => {
    // 移除 transition 以避免切换时的闪烁
    document.documentElement.style.transition = 'none';
    setTheme(isDark ? "light" : "dark");
    // 短暂延迟后恢复 transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.style.transition = '';
      });
    });
  };

  return (
    <button
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95 transition-transform duration-100 cursor-pointer"
      onClick={handleClick}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {isDark ? (
        // 太阳图标（暗色模式下显示）
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // 月亮图标（亮色模式下显示）
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
