import fs from "fs";
import path from "path";

// 支持的图片格式
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

/**
 * 扫描 public/images/gallery/ 目录，返回所有图片文件名
 * 在服务端运行，构建时自动执行
 */
export function getGalleryImages(): string[] {
  const galleryDir = path.join(process.cwd(), "public", "images", "gallery");

  // 目录不存在则返回空
  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  const files = fs.readdirSync(galleryDir);

  // 过滤出图片文件，按文件名排序
  const images = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    })
    .sort((a, b) => {
      // 如果文件名是数字，按数字排序；否则按字母排序
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

  return images;
}
