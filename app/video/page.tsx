import { getVideos } from "@/lib/video";
import VideoPlayer from "@/components/VideoPlayer";
import BiliBiliEmbed from "@/components/BiliBiliEmbed";

// B站视频列表：填入 BV 号
const BILIBILI_VIDEOS: { bvid: string; title: string }[] = [
  // { bvid: "BV1xx411c7mD", title: "示例B站视频" },
];

export const metadata = {
  title: "视频",
  description: "本地视频播放器",
};

export default function VideoPage() {
  const videos = getVideos();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">视频</h1>

      {/* 本地视频 */}
      {videos.length > 0 && (
        <>
          <p className="text-zinc-500 mb-6">本地媒体 · 共 {videos.length} 个</p>
          <VideoPlayer videos={videos} />
        </>
      )}

      {/* B站视频 */}
      {BILIBILI_VIDEOS.length > 0 && (
        <div className={videos.length > 0 ? "mt-16" : ""}>
          <h2 className="text-2xl font-bold mb-6">📺 B站视频</h2>
          <div className="grid gap-8">
            {BILIBILI_VIDEOS.map((video) => (
              <div key={video.bvid}>
                <p className="text-sm text-zinc-500 mb-2">{video.title}</p>
                <BiliBiliEmbed bvid={video.bvid} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {videos.length === 0 && BILIBILI_VIDEOS.length === 0 && (
        <p className="text-zinc-400 text-center py-20">
          还没有视频。本地视频放到 <code>public/videos/</code>，B站视频在代码中配置 BV 号。
        </p>
      )}
    </div>
  );
}
