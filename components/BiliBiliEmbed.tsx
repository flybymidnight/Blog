"use client";

import { useState } from "react";

interface BiliBiliEmbedProps {
  bvid: string; // B站视频 BV 号
}

export default function BiliBiliEmbed({ bvid }: BiliBiliEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-zinc-400 animate-pulse">加载中...</p>
        </div>
      )}
      <iframe
        src={`//player.bilibili.com/player.html?bvid=${bvid}&autoplay=0&high_quality=1`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media"
        onLoad={() => setLoaded(true)}
        title={`B站视频 ${bvid}`}
      />
    </div>
  );
}
