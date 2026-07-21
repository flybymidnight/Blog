"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useClickCounter } from "./ClickCounter";

export default function Logo() {
  const scale = useMotionValue(1);
  const rotate = useTransform(scale, [1, 0.5], [0, -15]);
  const { registerClick } = useClickCounter();

  // 鼠标移入：平滑缩小到 0.9
  const handleMouseEnter = () => {
    animate(scale, 0.9, { duration: 0.2, ease: "easeOut" });
  };

  // 鼠标移出：平滑恢复到 1.0
  const handleMouseLeave = () => {
    animate(scale, 1, { duration: 0.3, ease: "easeOut" });
  };

  // 鼠标按下：快速压缩到 0.5 + 计数
  const handleMouseDown = () => {
    registerClick();
    animate(scale, 0.5, { duration: 0.1, ease: "easeIn" });
  };

  // 鼠标松开：弹簧回弹到 0.9（此时鼠标还在上面）
  const handleMouseUp = () => {
    animate(scale, 0.9, {
      type: "spring",
      stiffness: 600,  // 弹簧硬度：越大弹得越快
      damping: 12,      // 阻尼：越小弹得越多次
      mass: 0.5,        // 质量：越小响应越快
    });
  };

  return (
    <Link href="/">
      <motion.span
        className="text-xl font-bold cursor-pointer inline-block"
        style={{ scale, rotate }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        韊
      </motion.span>
    </Link>
  );
}
