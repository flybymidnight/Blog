"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { ParticlesProvider, Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

// 初始化函数：加载精简版粒子引擎
// 必须在组件外部定义，保证引用稳定
async function initParticles(engine: Parameters<typeof loadSlim>[0]) {
  await loadSlim(engine);
}

// 粒子配置：星空效果
export default function ParticlesBg() {
  const { resolvedTheme } = useTheme();

  // 根据主题生成不同的粒子配置
  const options: ISourceOptions = useMemo(() => {
    const isDark = resolvedTheme === "dark";

    return {
      fullScreen: false,
      particles: {
        number: {
          value: 80,
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: {
          // 亮色模式：深色粒子（可见） | 暗色模式：亮色粒子（可见）
          value: isDark
            ? ["#ffffff", "#a5b4fc", "#c4b5fd"]
            : ["#18181b", "#6366f1", "#8b5cf6"],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.15, max: 0.5 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        size: {
          value: { min: 1, max: 3 },
          animation: { enable: true, speed: 1, sync: false },
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none",
          random: true,
          straight: false,
          outModes: "out",
        },
        links: { enable: false },
      },
      detectRetina: true,
    };
  }, [resolvedTheme]);

  return (
    <ParticlesProvider init={initParticles}>
      <Particles
        id="tsparticles"
        className="absolute inset-0"
        options={options}
      />
    </ParticlesProvider>
  );
}
