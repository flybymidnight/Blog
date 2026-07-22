import fs from "fs";
import path from "path";

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav", ".aac", ".flac", ".ogg", ".wma"];

/**
 * 扫描 public/music/ 目录，返回所有音频文件名
 */
export function getMusicFiles(): string[] {
  const musicDir = path.join(process.cwd(), "public", "music");

  if (!fs.existsSync(musicDir)) {
    return [];
  }

  return fs.readdirSync(musicDir)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    })
    .sort((a, b) => a.localeCompare(b));
}
