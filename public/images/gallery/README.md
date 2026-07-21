# 相册使用说明

把你的照片放到这个目录下，支持 `.jpg`、`.png`、`.webp` 格式。

## 命名规则

按数字命名：`1.jpg`、`2.jpg`、`3.jpg` ... 最多支持 100 张。

## 添加照片步骤

1. 把图片文件复制到 `public/images/gallery/` 目录
2. 打开 `app/gallery/page.tsx`
3. 修改 `PHOTOS` 数组中的数量（默认检测 20 张）

```tsx
// 把 20 改成你实际的照片数量
const PHOTOS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  src: `/images/gallery/${i + 1}.jpg`,
  alt: `照片 ${i + 1}`,
}));
```

## 注意事项

- 文件名必须是连续的数字（1, 2, 3, ...）
- 如果某张照片缺失，页面会自动跳过
- 建议图片尺寸不超过 2MB，加快加载速度
