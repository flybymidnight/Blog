import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Providers from "@/components/Providers";
import { ClickCounterProvider } from "@/components/ClickCounter";
import ConfettiEffect from "@/components/ConfettiEffect";
import "katex/dist/katex.min.css";
import "./globals.css";

// ===== 1. 字体加载 =====
// Next.js 会自动优化 Google Fonts，实现零布局偏移（FOUT）
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ===== 2. SEO 元数据 =====
// 搜索引擎会读取这些信息，显示在搜索结果中
export const metadata: Metadata = {
  title: {
    default: "韊",          // 首页标题
    template: "%s | 韊的博客",     // 子页面标题格式
  },
  description: "走着走着,柳暗花明",
};

// ===== 3. 导航链接配置 =====
// 集中管理，以后加新页面只改这里就行
const navLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/gallery", label: "相册" },
  { href: "/video", label: "视频" },
  { href: "/roast", label: "吐槽板" },
  { href: "/about", label: "关于" },
];

// ===== 4. 根布局组件 =====
// 这个组件会包裹所有页面，children 就是当前页面的内容
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // next-themes 会在客户端修改 class，需要抑制警告
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Providers>
        <ClickCounterProvider>
        <ConfettiEffect />
        {/* ===== 导航栏 ===== */}
        <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
          <nav className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* 左侧：动画 Logo */}
            <Logo />
            {/* 右侧：导航链接 + 主题切换 */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
            </div>
          </nav>
        </header>

        {/* ===== 主内容区 ===== */}
        {/* children 就是各个页面（page.tsx）的内容 */}
        <main className="flex-1">
          {children}
        </main>

        {/* ===== 页脚 ===== */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-zinc-500">
            <p>If we had no winter, the spring would not be so pleasan</p>
          </div>
        </footer>
        </ClickCounterProvider>
        <Analytics />
        </Providers>
      </body>
    </html>
  );
}