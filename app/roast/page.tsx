import RoastBoard from "@/components/RoastBoard";

export const metadata = {
  title: "吐槽板",
  description: "想说啥都行",
};

export default function RoastPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">🗣️ 吐槽板</h1>
      <p className="text-zinc-500 mb-8">随便说点什么吧</p>
      <RoastBoard />
    </div>
  );
}
