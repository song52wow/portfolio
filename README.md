# 作品集网站

基于 Next.js App Router 的个人影像作品集 MVP，支持 SEO、静态生成与本地视频托管。

## 快速开始

```bash
# 安装依赖（首次）
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run start
```

开发服务器默认地址：http://localhost:3000

## 目录结构

```
public/
  videos/          # 放置 MP4 视频文件
  images/          # 缩略图 / 海报
src/
  app/
    page.tsx       # 首页作品网格
    works/[slug]/  # 作品详情页
    layout.tsx     # 全局布局与 SEO metadata
    sitemap.ts     # 站点地图
    robots.ts      # 爬虫规则
  components/      # WorkCard、VideoPlayer 等
  data/works.ts    # 作品数据
```

## 添加新作品

1. 将视频文件放入 `public/videos/`，例如 `my-work.mp4`
2. 将缩略图放入 `public/images/`，例如 `my-work-poster.jpg`
3. 在 `src/data/works.ts` 的 `works` 数组中新增一条记录：

```ts
{
  id: "4",
  slug: "my-work",           // URL: /works/my-work
  title: "作品标题",
  description: "作品描述",
  videoSrc: "/videos/my-work.mp4",
  thumbnailSrc: "/images/my-work-poster.jpg",
  tags: ["标签1", "标签2"],
  year: 2025,
}
```

保存后重新构建即可，详情页会通过 `generateStaticParams` 自动生成静态页面。

## 放置视频文件

- 视频放在 `public/videos/`，通过 `/videos/文件名.mp4` 引用
- 详见 `public/videos/README.md`
- 当前示例作品使用占位封面，需自行替换对应 MP4 文件

## SEO 配置

- 根布局设置了站点级 `title` 模板、`description`、Open Graph
- 每个作品详情页通过 `generateMetadata` 生成独立 SEO 信息
- `sitemap.xml` 与 `robots.txt` 已配置

生产部署时建议设置环境变量：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

用于 sitemap、robots 和 Open Graph 的绝对 URL。
