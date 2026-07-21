import { getGalleryImages } from "@/lib/gallery";
import GalleryViewer from "@/components/GalleryViewer";

export const metadata = {
  title: "相册",
  description: "我的照片集",
};

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">相册</h1>
      <p className="text-zinc-500 mb-8">
        共 {images.length} 张 · 按 ← → 键切换 · 点击「自动」开启自动播放
      </p>
      <GalleryViewer images={images} />
    </div>
  );
}
