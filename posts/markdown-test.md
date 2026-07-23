---
title: "Markdown 功能测试"
date: "2026-07-21"
excerpt: "测试所有支持的 Markdown 功能：代码高亮、表格、数学公式、任务列表"
tags: ["测试", "Markdown"]
---

## 代码高亮测试

### TypeScript

```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const me: User = { name: "韊", age: 25 };
console.log(greet(me));
```

### Python

```python
def fibonacci(n: int) -> list[int]:
    """生成斐波那契数列"""
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 行内代码

使用 `npm install` 安装依赖，然后运行 `npm run dev` 启动开发服务器。

---

## 表格测试

| 语言 | 类型 | 用途 |
|---|---|---|
| TypeScript | 静态类型 | 前端/后端开发 |
| Python | 动态类型 | 数据科学/AI |
| Rust | 静态类型 | 系统编程 |

---

## 数学公式测试

### 行内公式

质能方程 $E = mc^2$ 是物理学中最著名的公式之一。

斐波那契数列的通项公式：$F_n = \frac{\varphi^n - \psi^n}{\sqrt{5}}$

### 块级公式

欧拉公式：

$$
e^{i\pi} + 1 = 0
$$

二次方程求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

积分：

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

---


## 其他 GFM 功能

### 删除线

~~这是被删除的文字~~，这是正常文字。

### 链接

访问 [GitHub](https://github.com) 了解更多。

### 引用

> 学而不思则罔，思而不学则殆。
> — 孔子

### 图片

![示例图片](/images/avatar.png)

---

## 纯文本测试

你也可以在 `posts/` 目录下放置 `.txt` 文件，系统会自动识别并展示为纯文本文章。
