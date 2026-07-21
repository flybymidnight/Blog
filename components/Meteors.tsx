"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

interface MeteorsProps { count?: number; }

interface MeteorData {
  id: number; startX: number; startY: number;
  delay: number; duration: number; length: number;
  distance: number; hue: number; headSize: number; tailWidth: number;
}

function generateMeteors(count: number): MeteorData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: -30 + Math.random() * 70,
    startY: -20 + Math.random() * 50,
    delay: Math.random() * 2.5,
    duration: 0.6 + Math.random() * 1.2,
    length: 100 + Math.random() * 200,
    distance: 400 + Math.random() * 600,
    hue: 200 + Math.random() * 80,
    headSize: 4 + Math.random() * 4,
    tailWidth: 1.5 + Math.random() * 1.5,
  }));
}

export default function Meteors({ count = 15 }: MeteorsProps) {
  const meteors = useMemo(() => generateMeteors(count), [count]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {/* 主流星体 */}
      {meteors.map((m) => {
        const bl = isDark ? 80 : 30;
        const head = `hsl(${m.hue},80%,${bl + 15}%)`;
        const tail = `hsl(${m.hue},60%,${bl}%)`;
        const glow = `hsl(${m.hue},90%,${bl + 20}%)`;
        return (
          <motion.div
            key={m.id}
            style={{
              position: "absolute",
              left: `${m.startX}vw`, top: `${m.startY}vh`,
              width: m.length, height: m.tailWidth,
              borderRadius: 999, rotate: 45,
              background: `linear-gradient(to right, transparent 0%, ${tail}40 20%, ${tail}80 60%, ${head} 90%, ${head} 100%)`,
              boxShadow: `0 0 ${m.headSize}px ${m.headSize / 2}px ${glow}40, 0 0 ${m.headSize * 3}px ${m.headSize}px ${glow}20`,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 0.8, 1, 1, 0.6, 0],
              scale: [0.3, 0.7, 1, 1, 0.8, 0.2],
              filter: ["blur(6px)", "blur(2px)", "blur(0px)", "blur(0px)", "blur(3px)", "blur(8px)"],
              x: [0, m.distance * 0.08, m.distance * 0.3, m.distance * 0.65, m.distance * 0.9, m.distance],
              y: [0, m.distance * 0.08, m.distance * 0.3, m.distance * 0.65, m.distance * 0.9, m.distance],
            }}
            transition={{
              duration: m.duration,
              delay: m.delay,
              ease: "easeInOut",
              times: [0, 0.06, 0.18, 0.65, 0.88, 1],
            }}
          />
        );
      })}

      {/* 拖尾火花 */}
      {meteors.slice(0, Math.floor(count / 3)).map((m) => {
        const sc = isDark ? `hsl(${m.hue},80%,85%)` : `hsl(${m.hue},70%,25%)`;
        return (
          <motion.div
            key={`sp-${m.id}`}
            style={{
              position: "absolute",
              left: `${m.startX + 2}vw`, top: `${m.startY + 1}vh`,
              width: 3, height: 3, borderRadius: "50%", rotate: 45,
              background: sc, boxShadow: `0 0 6px 2px ${sc}`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              x: [0, m.distance * 0.15, m.distance * 0.5, m.distance * 0.7],
              y: [0, m.distance * 0.15, m.distance * 0.5, m.distance * 0.7],
            }}
            transition={{
              duration: m.duration * 1.2,
              delay: m.delay + 0.15,
              ease: "easeOut",
              times: [0, 0.15, 0.6, 1],
            }}
          />
        );
      })}
    </div>
  );
}
