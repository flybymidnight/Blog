import { getVideos } from "@/lib/video";
import VideoPlayer from "@/components/VideoPlayer";

export const metadata = {
  title: "视频",
  description: "本地视频播放器",
};

export default function VideoPage() {
  const videos = getVideos();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">视频</h1>
      <p className="text-zinc-500 mb-8">共 {videos.length} 个媒体文件</p>
      <VideoPlayer videos={videos} />
    </div>
  );
}
