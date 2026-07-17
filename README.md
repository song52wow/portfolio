# 作品集

基于 Next.js App Router 的个人影像作品集，采用电影感铜黄暗金调视觉风格。

## 快速开始

```bash
npm install
npm run dev
npm run build
npm run start
```

开发服务器默认地址：http://localhost:3100

## 目录结构

```
public/
  videos/          视频文件
  images/          缩略图
src/
  app/
    page.tsx       单页沉浸式画廊
    layout.tsx     全局布局、字体与 SEO metadata
    robots.ts      爬虫规则
  components/
    ImmersiveGallery.tsx   沉浸式画廊组件
  data/works.ts    作品数据
```

## 添加新作品

1. 将视频文件放入 `public/videos/`，例如 `my-work.mp4`
2. 将缩略图放入 `public/images/`，例如 `my-work-poster.jpg`
3. 在 `src/data/works.ts` 的 `works` 数组中新增一条记录：

```ts
{
  id: "2",
  slug: "my-work",
  title: "My Work",
  description: "作品描述。",
  videoSrc: "/videos/my-work.mp4",
  thumbnailSrc: "/images/my-work-poster.jpg",
  tags: ["SHORT FILM"],
  year: 2026,
}
```

## 深链接

通过 query string 预选作品：
- `/` — 默认选中第一个作品
- `/?w=my-work` — 直接选中指定 slug 的作品

## 字体

Cinzel（英文大写罗马雕刻体）+ Noto Serif SC（中文衬线）在 `globals.css` 中通过 `@import` 从 Google Fonts 加载。

## 设计规格

详见 `docs/superpowers/specs/2026-06-23-ui-redesign-cinema-style-design.md`。
