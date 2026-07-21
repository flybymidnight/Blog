"use client";

import { type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface PressableProps {
  children: ReactNode;
  className?: string;
  /** hover 时的缩放，默认 0.9 */
  hoverScale?: number;
  /** 按下时的缩放，默认 0.5 */
  pressScale?: number;
}

export default function Pressable({
  children,
  className,
  hoverScale = 0.9,
  pressScale = 0.5,
}: PressableProps) {
  const scale = useMotionValue(1);
  const rotate = useTransform(scale, [1, pressScale], [0, -15]);

  return (
    <motion.span
      className={`inline-block cursor-pointer ${className ?? ""}`}
      style={{ scale, rotate }}
      onMouseEnter={() =>
        animate(scale, hoverScale, { duration: 0.2, ease: "easeOut" })
      }
      onMouseLeave={() =>
        animate(scale, 1, { duration: 0.3, ease: "easeOut" })
      }
      onMouseDown={() =>
        animate(scale, pressScale, { duration: 0.1, ease: "easeIn" })
      }
      onMouseUp={() =>
        animate(scale, hoverScale, {
          type: "spring",
          stiffness: 600,
          damping: 12,
          mass: 0.5,
        })
      }
    >
      {children}
    </motion.span>
  );
}
