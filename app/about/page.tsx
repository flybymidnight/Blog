import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
};

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">关于我</h1>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <p>
          我真是人类。
        </p>
        <p>
          这个博客是我想写啥就写啥的地方。
        </p>

        <h2>占位符</h2>
        <ul>
          <li>滚木滚木滚木滚木滚木滚木滚木滚木</li>
          <li>滚木滚木滚木滚木滚木滚木滚木滚木</li>
        </ul>

        <h2>联系方式</h2>
        <ul>
          <li><a href="https://github.com/flybymidnight" target="_blank" rel="noopener noreferrer">GitHub: flybymidnight</a></li>
          <li><a href="mailto:2565674734@qq.com">Email: 2565674734@qq.com</a></li>
        </ul>
      </div>
    </div>
  );
}