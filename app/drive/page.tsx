import CloudDrive from "@/components/CloudDrive";

export const metadata = {
  title: "仓库",
  description: "文件管理",
};

export default function DrivePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">☁️ 仓库</h1>
      <p className="text-zinc-500 mb-8">基米仓库</p>
      <CloudDrive />
    </div>
  );
}
