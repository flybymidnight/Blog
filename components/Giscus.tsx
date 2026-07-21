"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface GiscusProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  reactionsEnabled?: boolean;
  inputPosition?: "top" | "bottom";
}

export default function Giscus({
  repo,
  repoId,
  category,
  categoryId,
  mapping = "pathname",
  reactionsEnabled = true,
  inputPosition = "bottom",
}: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // 根据当前主题选择 Giscus 主题
  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    if (!ref.current) return;

    // 清除旧的 Giscus
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-reactions-enabled", reactionsEnabled ? "1" : "0");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, [repo, repoId, category, categoryId, mapping, reactionsEnabled, inputPosition, giscusTheme]);

  // 主题切换时通知已加载的 Giscus iframe 更新主题
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    if (!iframe) return;

    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      "https://giscus.app"
    );
  }, [giscusTheme]);

  return <div ref={ref} className="mt-12" />;
}
