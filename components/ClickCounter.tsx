"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// 上下文类型
interface ClickCounterContextType {
  count: number;
  registerClick: () => void;
}

// 创建上下文
const ClickCounterContext = createContext<ClickCounterContextType>({
  count: 0,
  registerClick: () => {},
});

// Provider：包裹在首页外层，管理全局计数
export function ClickCounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const registerClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <ClickCounterContext.Provider value={{ count, registerClick }}>
      {children}
    </ClickCounterContext.Provider>
  );
}

// Hook：供 Pressable 等组件使用
export function useClickCounter() {
  return useContext(ClickCounterContext);
}
