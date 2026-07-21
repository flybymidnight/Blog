"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 全局撒花：每次页面切换时自动播放
export default function ConfettiEffect() {
  const pathname = usePathname();

  useEffect(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      // 左侧喷发
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#a855f7", "#6366f1", "#ec4899", "#f59e0b", "#10b981"],
      });
      // 右侧喷发
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#a855f7", "#6366f1", "#ec4899", "#f59e0b", "#10b981"],
      });
    });
  }, [pathname]); // pathname 变化时重新播放

  return null;
}
