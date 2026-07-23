"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 路由切换时的顶部进度条
 * 模拟 NProgress 效果：快速推进到 80%，完成后到 100% 再消失
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 路由变化时触发
    setVisible(true);
    setProgress(0);

    // 快速推进到 80%
    const t1 = setTimeout(() => setProgress(80), 50);
    // 推进到 95%
    const t2 = setTimeout(() => setProgress(95), 200);
    // 完成
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 0 ? "0ms" : progress === 100 ? "300ms" : "200ms",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
