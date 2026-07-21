"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import type { PostMeta } from "@/lib/posts";
import ParticlesBg from "./ParticlesBg";
import Pressable from "./Pressable";
import Meteors from "./Meteors";
import { useClickCounter } from "./ClickCounter";

export default function AnimatedHome({ posts }: { posts: PostMeta[] }) {
  const { count, registerClick } = useClickCounter();
  const [showMeteors, setShowMeteors] = useState(false);
  const [meteorKey, setMeteorKey] = useState(0);
  const [meteorCount, setMeteorCount] = useState(15);

  // 滚动检测：用于滚动提示图标的淡入淡出
  const { scrollY } = useScroll();
  // 滚动 0~150px 时，opacity 从 1 渐变到 0（对称：滚回来会从 0 回到 1）
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  // 监听计数，每点击 10 次触发流星
  useEffect(() => {
    if (count > 0 && count % 10 === 0) {
      // 流星数量随点击次数递增，最多 40 颗
      setMeteorCount(Math.min(10 + Math.floor(count / 10) * 5, 40));
      setMeteorKey((k) => k + 1);
      setShowMeteors(true);
    }
  }, [count]);

  // 流星播放 3.5 秒后自动隐藏
  useEffect(() => {
    if (showMeteors) {
      const timer = setTimeout(() => setShowMeteors(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showMeteors, meteorKey]);

  return (
    <>
      {/* Hero 全屏区域 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500">
        <ParticlesBg />

        {/* 流星特效层 */}
        {showMeteors && <Meteors key={meteorKey} count={meteorCount} />}

        <div className="relative z-10 text-center px-6">
          {/* 头像 */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <Pressable hoverScale={0.95} pressScale={0.8}>
              <div
                className="relative w-28 h-28 mx-auto rounded-full overflow-hidden ring-4 ring-zinc-300 dark:ring-white/30 shadow-2xl cursor-pointer"
                onMouseDown={registerClick}
              >
                <Image
                  src="/images/avatar.png"
                  alt="头像"
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              </div>
            </Pressable>
          </motion.div>

          {/* 标题：逐字出现 + 逐字可点击 */}
          <motion.h1
            className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {"你好,欢迎你来".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              >
                <Pressable hoverScale={0.85} pressScale={0.4}>
                  {char}
                </Pressable>
              </motion.span>
            ))}
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            className="mt-4 text-lg text-zinc-600 dark:text-white/80 drop-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <Pressable hoverScale={0.95} pressScale={0.7}>
              一些过程的注脚罢了
            </Pressable>
          </motion.p>

          {/* 按钮 */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <Pressable hoverScale={0.95} pressScale={0.85}>
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 rounded-full bg-zinc-900/10 dark:bg-white/20 backdrop-blur-sm text-zinc-900 dark:text-white text-sm font-medium border border-zinc-900/20 dark:border-white/30 hover:bg-zinc-900/20 dark:hover:bg-white/30 transition-all duration-300"
              >
                阅读文章 ↓
              </Link>
            </Pressable>
          </motion.div>

          {/* 向下滚动提示：向下滚动时淡出，向上滚动时淡入 */}
          <motion.div
            className="mt-16"
            style={{ opacity: scrollIndicatorOpacity }}
          >
            <Pressable hoverScale={0.8} pressScale={0.5}>
              <motion.div
                className="w-6 h-10 mx-auto rounded-full border-2 border-zinc-400/40 dark:border-white/40 flex justify-center pt-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/60 dark:bg-white/60" />
              </motion.div>
            </Pressable>
          </motion.div>
        </div>
      </section>

      {/* 文章列表区域 */}
      <div className="max-w-3xl mx-auto px-6">
        <section className="py-20">
          <motion.h2
            className="text-2xl font-bold mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <Pressable hoverScale={0.95} pressScale={0.8}>
              最新文章
            </Pressable>
          </motion.h2>

          <div className="flex flex-col gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.slug}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Pressable hoverScale={0.98} pressScale={0.95}>
                    <div>
                      <p className="text-sm text-zinc-500 mb-1">{post.date}</p>
                      <h3 className="text-xl font-semibold group-hover:underline underline-offset-4">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Pressable>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}