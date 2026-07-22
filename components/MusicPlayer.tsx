"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface MusicPlayerProps {
  playlist: string[];
}

export default function MusicPlayer({ playlist }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false); // 用 ref 追踪播放状态，避免重渲染影响
  const hasAutoPlayed = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const getDisplayName = (filename: string) => filename.replace(/\.[^.]+$/, "");

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlayingRef.current) {
      audioRef.current.pause();
      // onPause 事件会同步状态
    } else {
      audioRef.current.play().then(() => {
        // onPlay 事件会同步状态
      }).catch(() => {});
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
  }, []);

  const playAudio = useCallback(() => {
    if (!audioRef.current || isPlayingRef.current) return;
    audioRef.current.play().then(() => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      hasAutoPlayed.current = true; // 只在真正播放成功后才标记
    }).catch(() => {
      // 浏览器阻止了，不标记 hasAutoPlayed，等用户点击
    });
  }, []);

  const nextTrack = useCallback(() => {
    setCurrent((c) => {
      const next = (c + 1) % playlist.length;
      // 切歌后自动播放（用 setTimeout 确保 src 已更新）
      setTimeout(() => playAudio(), 100);
      return next;
    });
  }, [playlist.length, playAudio]);

  const prevTrack = useCallback(() => {
    setCurrent((c) => {
      const prev = (c - 1 + playlist.length) % playlist.length;
      setTimeout(() => playAudio(), 100);
      return prev;
    });
  }, [playlist.length, playAudio]);

  // 首次挂载：监听用户点击触发自动播放
  useEffect(() => {
    const tryPlay = () => {
      if (!hasAutoPlayed.current && audioRef.current) {
        audioRef.current.play().then(() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          hasAutoPlayed.current = true;
        }).catch(() => {});
      }
    };
    document.addEventListener("click", tryPlay);
    document.addEventListener("touchstart", tryPlay);
    return () => {
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, []);

  // 音频 canplay 事件：尝试播放（不手动设 hasAutoPlayed，由 playAudio 内部处理）
  const handleCanPlay = useCallback(() => {
    playAudio();
  }, [playAudio]);

  // 切歌后恢复播放状态
  const handleLoadedData = useCallback(() => {
    if (isPlayingRef.current) {
      audioRef.current?.play().catch(() => {});
    }
  }, []);

  if (playlist.length === 0) return null;

  const src = `/music/${encodeURIComponent(playlist[current])}`;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onPause={() => { isPlayingRef.current = false; setIsPlaying(false); }}
        onPlay={() => { isPlayingRef.current = true; setIsPlaying(true); }}
        loop={playlist.length === 1}
      />

      {/* 浮动控制面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-50 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <p className="text-sm font-bold mb-3 truncate">{getDisplayName(playlist[current])}</p>
            <input type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek}
              className="w-full h-1 mb-3 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-700 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <div className="flex items-center justify-center gap-4">
              <button onClick={prevTrack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-lg">⏮</button>
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors">
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={nextTrack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-lg">⏭</button>
            </div>
            {/* 播放列表 */}
            {playlist.length > 1 && (
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 max-h-40 overflow-y-auto">
                {playlist.map((file, i) => (
                  <button key={file} onClick={() => { setCurrent(i); hasAutoPlayed.current = true; setTimeout(() => playAudio(), 100); }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-lg truncate transition-colors ${i === current ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                    {getDisplayName(file)}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动按钮 */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        animate={isPlaying ? { rotate: [0, 360] } : {}}
        transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
      >
        {isPlaying ? "🎵" : "🎶"}
      </motion.button>
    </>
  );
}
