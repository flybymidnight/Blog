import { getAllPosts } from "@/lib/posts";
import AnimatedHome from "@/components/AnimatedHome";

export default function Home() {
  // 服务端读取数据（fs 在这里正常工作）
  const posts = getAllPosts().slice(0, 5);

  // 把数据传给客户端动画组件
  return <AnimatedHome posts={posts} />;
}