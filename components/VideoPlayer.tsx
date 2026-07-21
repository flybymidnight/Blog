"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";

interface VideoPlayerProps {
  videos: string[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentVideo = videos[currentIndex];
  const isAudio = /\.(m4a|mp3|wav|aac|flac)$/i.test(currentVideo);

  const switchVideo = (index: number) => {
    setCurrentIndex(index);
    setError(null);
  };

  const handleError = () => {
    setError(`无法播放: ${currentVideo}`);
  };

  const handleEnded = () => {
    if (currentIndex < videos.length - 1) {
      switchVideo(currentIndex + 1);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-lg">还没有视频 🎬</p>
        <p className="text-zinc-400 mt-2">
          把视频放到 <code className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">public/videos/</code> 目录下即可自动识别
        </p>
        <p className="text-zinc-400 mt-1 text-sm">支持 .mp4 / .webm / .ogg / .mov / .m4a / .mp3 格式</p>
      </div>
    );
  }

  return (
    <>
      {/* 视频播放器 */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden ${isAudio ? "bg-zinc-100 dark:bg-zinc-900" : "bg-black"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isAudio ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium text-lg truncate max-w-full px-4">
              {currentVideo}
            </p>
            <audio
              ref={audioRef}
              src={`/videos/${currentVideo}`}
              onEnded={handleEnded}
              className="mt-4 w-full max-w-md"
              controls
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={`/videos/${currentVideo}`}
            className="w-full aspect-video"
            onEnded={handleEnded}
            onError={handleError}
            controls
            preload="metadata"
          />
        )}

        {/* 控制栏由浏览器原生 controls 提供 */}
      </motion.div>

      {/* 当前文件名 */}
      <p className="mt-4 text-lg font-medium">{currentVideo}</p>
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}

      {/* 播放列表 */}
      {videos.length > 1 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">播放列表</h2>
          <div className="flex flex-col gap-2">
            {videos.map((filename, i) => (
              <button
                key={filename}
                onClick={() => switchVideo(i)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  i === currentIndex
                    ? "bg-zinc-200 dark:bg-zinc-800"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-lg">
                  {/\.(m4a|mp3|wav|aac|flac)$/i.test(filename) ? "🎵" : "🎬"}
                </span>
                <span className="font-medium truncate">{filename}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
