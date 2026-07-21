"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// 音乐列表：把音乐放到 public/music/ 下，或使用外链
const PLAYLIST = [
  { title: "示例音乐", src: "/music/demo.mp3" },
  // 添加更多：
  // { title: "歌曲名", src: "/music/song.mp3" },
  // { title: "外链歌曲", src: "https://xxx.com/song.mp3" },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
  };

  const nextTrack = () => {
    setCurrent((c) => (c + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrent((c) => (c - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [current]);

  if (PLAYLIST.length === 0 || !PLAYLIST[0].src) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={PLAYLIST[current].src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={nextTrack}
        loop={PLAYLIST.length === 1}
      />

      {/* 浮动控制面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-50 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <p className="text-sm font-bold mb-3 truncate">{PLAYLIST[current].title}</p>

            {/* 进度条 */}
            <input
              type="range" min="0" max="100" step="0.1"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 mb-3 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-700 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={prevTrack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-lg">⏮</button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={nextTrack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-lg">⏭</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动按钮 */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isPlaying ? { rotate: [0, 360] } : {}}
        transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
      >
        {isPlaying ? "🎵" : "🎶"}
      </motion.button>
    </>
  );
}
