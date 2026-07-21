import fs from "fs";
import path from "path";

// 支持的媒体格式
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
const AUDIO_EXTENSIONS = [".m4a", ".mp3", ".wav", ".aac", ".flac"];

// 判断是否为音频文件
export function isAudioFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext);
}

/**
 * 扫描 public/videos/ 目录，返回所有视频文件名
 */
export function getVideos(): string[] {
  const videosDir = path.join(process.cwd(), "public", "videos");

  if (!fs.existsSync(videosDir)) {
    return [];
  }

  const files = fs.readdirSync(videosDir);

  return files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS].includes(ext);
    })
    .sort((a, b) => a.localeCompare(b));
}
