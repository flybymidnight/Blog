"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface GalleryViewerProps {
  images: string[]; // 图片文件名列表
}

export default function GalleryViewer({ images }: GalleryViewerProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false); // 默认关闭自动播放

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    if (images.length === 0) return;
    setDirection(1);
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    setDirection(-1);
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  // 自动播放（仅在开启时生效）
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [autoPlay, images.length, next]);

  // 键盘左右箭头
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-lg">
          还没有照片 📷
        </p>
        <p className="text-zinc-400 mt-2">
          把图片放到 <code className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">public/images/gallery/</code> 目录下即可自动识别
        </p>
        <p className="text-zinc-400 mt-1 text-sm">
          支持 .jpg / .png / .webp / .gif / .avif 格式，无需改名
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 主图展示区 */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            className="absolute inset-0"
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={`/images/gallery/${images[current]}`}
              alt={images[current]}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* 左右箭头 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 dark:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 dark:hover:bg-white/30 transition-colors"
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 dark:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 dark:hover:bg-white/30 transition-colors"
              aria-label="下一张"
            >
              ›
            </button>
          </>
        )}

        {/* 底部控制栏：计数器 + 自动播放开关 */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* 自动播放开关 */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-2.5 py-1 rounded-full text-xs backdrop-blur-sm transition-all ${
              autoPlay
                ? "bg-white/90 text-zinc-900"
                : "bg-black/40 text-white/80 hover:bg-black/60"
            }`}
          >
            {autoPlay ? "⏸ 暂停" : "▶ 自动"}
          </button>
          {/* 计数器 */}
          <div className="px-3 py-1 rounded-full bg-black/40 text-white text-sm backdrop-blur-sm">
            {current + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* 缩略图导航 */}
      {images.length > 1 && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {images.map((filename, i) => (
            <button
              key={filename}
              onClick={() => goTo(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                i === current
                  ? "ring-2 ring-zinc-900 dark:ring-white scale-105"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={`/images/gallery/${filename}`}
                alt={filename}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
