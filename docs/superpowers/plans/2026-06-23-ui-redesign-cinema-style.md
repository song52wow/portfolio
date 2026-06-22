# 作品集 UI 重设计 — 电影感暗金调 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将作品集网站从通用暗色风格升级为电影感铜黄冷金调,保留沉浸式画廊交互骨架,删除未使用组件和详情路由。

**Architecture:** 单页沉浸式画廊 + 双视频层 250ms 交叉溶解切换 + query string 深链接 + Cinzel/思源宋体 + 铜黄调色板。删除孤儿组件、孤儿路由、动态 sitemap,简化代码结构。

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2.4, TypeScript, Tailwind CSS v4, `next/font/google` (Cinzel + Noto Serif SC)

**Testing Note:** 项目当前无测试基础设施(无 vitest/jest/playwright)。本计划以 `npm run build` 和手动视觉验证作为每个任务的验证手段,符合规格第 9 节。

---

## 文件结构(目标态)

```
src/
├── app/
│   ├── layout.tsx              改:引入 Cinzel + Noto Serif SC,铜黄主题色变量
│   ├── page.tsx                保持
│   ├── globals.css             改:铜黄调色板、video crossfade 类
│   └── robots.ts               保持
├── components/
│   └── ImmersiveGallery.tsx    重写
└── data/
    └── works.ts                保持(简化数据)

删除:
- src/components/SiteHeader.tsx
- src/components/WorkCard.tsx
- src/components/VideoPlayer.tsx
- src/app/works/[slug]/page.tsx (及整个 [slug] 子目录)
- src/app/sitemap.ts
```

---

## Task 1: 删除孤儿组件

**Files:**
- Delete: `src/components/SiteHeader.tsx`
- Delete: `src/components/WorkCard.tsx`
- Delete: `src/components/VideoPlayer.tsx`

- [ ] **Step 1: 删除 3 个未使用的组件文件**

```bash
cd /Volumes/Extension/song52wow/exhibition-works
git rm src/components/SiteHeader.tsx
git rm src/components/WorkCard.tsx
git rm src/components/VideoPlayer.tsx
```

预期:3 个文件被删除。

- [ ] **Step 2: 验证没有引用残留**

```bash
grep -rn "SiteHeader\|WorkCard\|VideoPlayer" src/
```

预期:无输出(grep 无匹配)。

- [ ] **Step 3: 运行 build 确认没有破坏**

```bash
npm run build 2>&1 | tail -20
```

预期:`Compiled successfully` 或类似成功消息,无 TypeScript 错误。

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused components (SiteHeader/WorkCard/VideoPlayer)"
```

---

## Task 2: 删除详情路由和动态 sitemap

**Files:**
- Delete: `src/app/works/[slug]/page.tsx`
- Delete: `src/app/works/` (整个目录)
- Delete: `src/app/sitemap.ts`

- [ ] **Step 1: 删除动态详情路由**

```bash
cd /Volumes/Extension/song52wow/exhibition-works
git rm -r src/app/works/
```

预期:`src/app/works/` 目录被删除。

- [ ] **Step 2: 删除 sitemap.ts**

```bash
git rm src/app/sitemap.ts
```

预期:`src/app/sitemap.ts` 被删除。

- [ ] **Step 3: 验证没有引用残留**

```bash
grep -rn "works/\[slug\]\|sitemap\|generateStaticParams" src/
```

预期:无输出。

- [ ] **Step 4: 运行 build**

```bash
npm run build 2>&1 | tail -20
```

预期:`Compiled successfully`,无错误。

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove works/[slug] detail route and dynamic sitemap"
```

---

## Task 3: 在 layout.tsx 引入新字体

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 用 next/font 引入 Cinzel 和 Noto Serif SC**

替换 `src/app/layout.tsx` 的整个内容:

```tsx
import type { Metadata } from "next";
import { Cinzel, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const siteName = "作品集";
const siteDescription =
  "个人影像作品集,展示短片、实验影像与视觉创作。";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: siteName,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${cinzel.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="overflow-hidden bg-[var(--background)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
```

注意:
- `title` 字段直接是字符串(不是对象),因为不再有子页面使用 template
- body 用 CSS 变量作为颜色,稍后在 globals.css 中定义
- 不再使用 Geist Sans/Mono 字体
- **如果 `next/font/google` 导入 Cinzel 报错**说该字体不存在(罕见情况),回退方案:用 `localFont` 加载本地 woff2。但 Cinzel 在 Google Fonts 上是稳定可用的。

- [ ] **Step 2: 运行 build 验证**

```bash
npm run build 2>&1 | tail -25
```

预期:`Compiled successfully`。如果字体下载失败(无网络),会报 fetch 错误——这种情况下回退到方案 B 在 Task 5 处理。

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(layout): introduce Cinzel + Noto Serif SC, remove Geist"
```

---

## Task 4: 重写 globals.css(铜黄调色板)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 用铜黄调色板重写 globals.css**

完全替换 `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  /* 铜黄冷金调色板 */
  --background: #0a0806;       /* 深棕黑底 */
  --surface:    #14110d;       /* 面板底(备用) */
  --border:     #2a2520;       /* 描边 */
  --gold:       #b8860b;       /* 黄铜金(主点缀) */
  --gold-soft:  #cd9b3a;       /* 黄铜金(hover) */
  --gold-pale:  #6b5418;       /* 黄铜金(暗调) */
  --text:       #e6dec5;       /* 浅金主文字 */
  --text-dim:   #8a7d5f;       /* 浅金次文字 */
  --text-mute:  #5a5142;       /* 浅金最弱文字 */
  --rec:        #c0392b;       /* 录制指示灯红(仅 REC 圆点) */
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-gold: var(--gold);
  --color-gold-soft: var(--gold-soft);
  --color-gold-pale: var(--gold-pale);
  --color-text: var(--text);
  --color-text-dim: var(--text-dim);
  --color-text-mute: var(--text-mute);
  --font-cinzel: var(--font-cinzel), "Times New Roman", serif;
  --font-noto: var(--font-noto-serif-sc), "Source Han Serif SC", "Songti SC", serif;
}

body {
  background: var(--background);
  color: var(--text);
  font-family: var(--font-noto), var(--font-cinzel), serif;
}

/* 视频层交叉溶解 */
.video-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 250ms ease-in-out;
  pointer-events: none;
}
.video-layer.active {
  opacity: 1;
}
```

- [ ] **Step 2: 验证 CSS 变量在 Tailwind v4 中可访问**

Tailwind v4 自动暴露 CSS 变量,所以 `--color-gold` 可在类中使用(如 `text-gold`、`bg-gold`)。

运行:

```bash
npm run build 2>&1 | tail -10
```

预期:`Compiled successfully`。

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(styles): brass-gold palette + Cinzel theme tokens + crossfade class"
```

---

## Task 5: 简化 works.ts 数据

**Files:**
- Modify: `src/data/works.ts`

- [ ] **Step 1: 用铜黄标签数据替换 works.ts**

完全替换 `src/data/works.ts`:

```ts
export type Work = {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoSrc: string;
  thumbnailSrc: string;
  tags?: string[];
  year?: number;
};

export const works: Work[] = [
  {
    id: "1",
    slug: "baabaabet",
    title: "BaaBaaBet",
    description:
      "覆盖赛事大厅、下单处理、自建事件、Membership NFT、个人中心全链路的 Web3 链上预测 DApp。",
    videoSrc: "/videos/baabaabet.mov",
    thumbnailSrc: "/images/baabaabet.png",
    tags: ["DAPP", "WEB3", "PREDICTION"],
    year: 2025,
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getAllWorkSlugs(): string[] {
  return works.map((work) => work.slug);
}
```

注意:
- slug 改为小写 `baabaabet`(原值 `BaaBaaBet` 大小写不一致可能引发 URL 问题,统一为小写)
- tags 改为大写英文标签(Cinzel 大写后效果更好)

- [ ] **Step 2: 运行 build**

```bash
npm run build 2>&1 | tail -10
```

预期:`Compiled successfully`。

- [ ] **Step 3: Commit**

```bash
git add src/data/works.ts
git commit -m "refactor(data): lowercase slugs, uppercase English tags"
```

---

## Task 6: 重写 ImmersiveGallery.tsx — 基础铜黄样式

**Files:**
- Modify: `src/components/ImmersiveGallery.tsx`

这是核心任务,分两个 step 完成。本 step 实现铜黄样式;Task 7 实现双视频层交叉溶解;Task 8 实现 query string 深链接。

- [ ] **Step 1: 完整替换 ImmersiveGallery.tsx**

完全替换 `src/components/ImmersiveGallery.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { works, type Work } from "@/data/works";

type ImmersiveGalleryProps = {
  initialSlug?: string;
};

export function ImmersiveGallery({ initialSlug }: ImmersiveGalleryProps) {
  const router = useRouter();
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [selectedSlug, setSelectedSlug] = useState(
    () => initialSlug ?? works[0]?.slug ?? "",
  );
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const [layerASlug, setLayerASlug] = useState(selectedSlug);
  const [layerBSlug, setLayerBSlug] = useState<string | null>(null);

  const selectedWork =
    works.find((work) => work.slug === selectedSlug) ?? works[0];
  const selectedIndex = works.findIndex((work) => work.slug === selectedSlug);

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
      setLayerASlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    const el = itemRefs.current.get(selectedSlug);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedSlug]);

  // 当 pendingSlug 变化时,加载 layerB
  useEffect(() => {
    if (!pendingSlug || pendingSlug === layerASlug) return;
    setLayerBSlug(pendingSlug);
    setActiveLayer("B");
    const video = videoBRef.current;
    if (!video) return;
    video.load();
    void video.play().catch(() => {});
  }, [pendingSlug, layerASlug]);

  // 当 layerB 视频 loadeddata 后,250ms 完成切换
  const handleLayerBLoaded = useCallback(() => {
    const timer = setTimeout(() => {
      setLayerASlug((prev) => {
        const next = layerBSlug ?? prev;
        setActiveLayer("A");
        setLayerBSlug(null);
        setPendingSlug(null);
        return next;
      });
      // 替换 URL,但不滚动
      if (pendingSlug) {
        router.replace(`/?w=${pendingSlug}`, { scroll: false });
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [layerBSlug, pendingSlug, router]);

  const selectWork = useCallback(
    (work: Work) => {
      if (work.slug === selectedSlug) return;
      setSelectedSlug(work.slug);
      setPendingSlug(work.slug);
    },
    [selectedSlug],
  );

  const toggleMute = useCallback(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    [videoA, videoB].forEach((v) => {
      if (!v) return;
      v.muted = !v.muted;
    });
    setIsMuted((m) => !m);
  }, []);

  if (!selectedWork) return null;

  const currentWorkA = works.find((w) => w.slug === layerASlug) ?? selectedWork;
  const currentWorkB = layerBSlug
    ? works.find((w) => w.slug === layerBSlug)
    : null;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* 双视频层 */}
      <video
        ref={videoARef}
        key={`a-${currentWorkA.slug}`}
        className={`video-layer ${activeLayer === "A" && !pendingSlug ? "active" : ""}`}
        src={currentWorkA.videoSrc}
        poster={currentWorkA.thumbnailSrc}
        autoPlay
        muted={isMuted}
        playsInline
        loop
        preload="auto"
        aria-label={`${currentWorkA.title} 视频`}
      />
      {currentWorkB && (
        <video
          ref={videoBRef}
          key={`b-${currentWorkB.slug}`}
          className={`video-layer ${activeLayer === "B" ? "active" : ""}`}
          src={currentWorkB.videoSrc}
          poster={currentWorkB.thumbnailSrc}
          autoPlay
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          onLoadedData={handleLayerBLoaded}
          aria-label={`${currentWorkB.title} 视频`}
        />
      )}

      {/* 顶部:左上 REC 编号 + 右上 SOUND 按钮 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6">
        <div
          className="pointer-events-auto flex items-center gap-2 text-[var(--text-dim)]"
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "10px",
            letterSpacing: "0.35em",
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--rec)" }}
            aria-hidden
          />
          <span>REC // N°{String(selectedIndex + 1).padStart(2, "0")}</span>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? "开启声音" : "关闭声音"}
          className="pointer-events-auto rounded-full border px-3 py-1.5 text-[var(--gold)] transition-colors hover:border-[var(--gold-soft)] hover:text-[var(--gold-soft)]"
          style={{
            fontFamily: "var(--font-cinzel)",
            borderColor: "var(--gold)",
            fontSize: "10px",
            letterSpacing: "0.3em",
          }}
        >
          {isMuted ? "SOUND OFF" : "SOUND ON"}
        </button>
      </div>

      {/* 底部面板 */}
      <div
        className="absolute inset-x-4 bottom-6 z-20 sm:inset-x-6"
        role="region"
        aria-label="作品信息"
      >
        {/* 顶部金线分隔 */}
        <div
          className="mb-4 h-px w-full"
          style={{ background: "var(--gold-pale)" }}
          aria-hidden
        />

        {/* 标题与元数据 */}
        <div className="px-2 pb-4 sm:px-4">
          <h1
            className="text-[var(--text)]"
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: "clamp(24px, 4vw, 36px)",
              letterSpacing: "0.2em",
              lineHeight: 1.1,
            }}
          >
            {selectedWork.title.toUpperCase()}
          </h1>
          {/* 标题下方短金线 */}
          <div
            className="mt-3 h-[2px] w-10"
            style={{ background: "var(--gold)" }}
            aria-hidden
          />
          <div
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--text-dim)]"
            style={{ fontSize: "11px", letterSpacing: "0.3em" }}
          >
            {selectedWork.year && <span>{selectedWork.year}</span>}
            {selectedWork.tags && selectedWork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedWork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border px-2 py-0.5 text-[var(--gold-soft)]"
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      borderColor: "var(--gold)",
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p
            className="mt-3 text-[var(--text-dim)]"
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "14px",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            {selectedWork.description}
          </p>
        </div>

        {/* 缩略图带 */}
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          <div className="flex snap-x snap-mandatory gap-3 px-2 pb-2 sm:gap-4 sm:px-4">
            {works.map((work) => {
              const isSelected = work.slug === selectedSlug;
              return (
                <button
                  key={work.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(work.slug, el);
                    else itemRefs.current.delete(work.slug);
                  }}
                  type="button"
                  onClick={() => selectWork(work)}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`播放 ${work.title}`}
                  className="group shrink-0 snap-center overflow-hidden rounded-md transition-colors"
                  style={{
                    border: `1px solid ${isSelected ? "var(--gold)" : "var(--gold-pale)"}`,
                    boxShadow: isSelected
                      ? "0 0 0 1px var(--gold-soft), 0 0 12px rgba(184, 134, 11, 0.25)"
                      : "none",
                  }}
                >
                  <div className="relative h-[4.5rem] w-[5.5rem] bg-[var(--surface)] sm:h-[5rem] sm:w-[6.5rem]">
                    <Image
                      src={work.thumbnailSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="104px"
                      aria-hidden
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-4"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10, 8, 6, 0.85), transparent)",
                      }}
                    >
                      <span
                        className="line-clamp-1 block text-left text-[var(--text)]"
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {work.title.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行 build 验证**

```bash
npm run build 2>&1 | tail -25
```

预期:`Compiled successfully`。如果有 TypeScript 错误(例如 React 类型不匹配),按错误信息修复。

- [ ] **Step 3: 启动 dev server 视觉验证(可选)**

```bash
npm run dev
```

打开 http://localhost:3000,确认:
- 深棕黑底 + 黄铜金点缀
- 顶部 REC 编号 + SOUND OFF 按钮
- 底部面板标题用 Cinzel 大写
- 缩略图带黄铜金边

Ctrl+C 停止服务器。

- [ ] **Step 4: Commit**

```bash
git add src/components/ImmersiveGallery.tsx
git commit -m "feat(gallery): cinema gold styling + Cinzel/Noto Serif typography"
```

---

## Task 7: 实现双视频层 250ms 交叉溶解

> Task 6 已包含双视频层结构。本 task 重点修复和精炼交叉溶解时序,确保 250ms 平滑过渡。

**Files:**
- Modify: `src/components/ImmersiveGallery.tsx`

- [ ] **Step 1: 重读当前 ImmersiveGallery.tsx 中 `handleLayerBLoaded`**

确认当前实现中:
- `setTimeout(..., 260)` 在视频 loadeddata 后触发
- 旧 layerA 被替换为新 layerB,layerB 清空
- URL 同步通过 `router.replace`

- [ ] **Step 2: 添加降级超时(若视频加载超过 1.5s 未触发 loadeddata)**

在 `useEffect` (pendingSlug 变化后) 中加入超时降级:

找到这个 useEffect:

```tsx
useEffect(() => {
  if (!pendingSlug || pendingSlug === layerASlug) return;
  setLayerBSlug(pendingSlug);
  setActiveLayer("B");
  const video = videoBRef.current;
  if (!video) return;
  video.load();
  void video.play().catch(() => {});
}, [pendingSlug, layerASlug]);
```

替换为:

```tsx
useEffect(() => {
  if (!pendingSlug || pendingSlug === layerASlug) return;
  setLayerBSlug(pendingSlug);
  setActiveLayer("B");
  const video = videoBRef.current;
  if (!video) return;
  video.load();
  void video.play().catch(() => {});

  // 降级:1.5s 内 loadeddata 未触发,强制切换
  const fallback = setTimeout(() => {
    setLayerASlug(pendingSlug);
    setActiveLayer("A");
    setLayerBSlug(null);
    setPendingSlug(null);
    router.replace(`/?w=${pendingSlug}`, { scroll: false });
  }, 1500);

  return () => clearTimeout(fallback);
}, [pendingSlug, layerASlug, router]);
```

- [ ] **Step 3: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

预期:`Compiled successfully`。

- [ ] **Step 4: 手动验证切换动画**

```bash
npm run dev
```

打开 http://localhost:3000:
1. 等待第一个视频加载
2. 点击底部缩略图(目前只有一个,所以无视觉变化)—— 跳过此项,实际只有 1 个作品时双视频层无意义
3. 添加第二个作品测试:临时在 `src/data/works.ts` 添加:
   ```ts
   {
     id: "2",
     slug: "light-portrait",
     title: "Light Portrait",
     description: "夜色中的肖像,镜头缓缓推近。",
     videoSrc: "/videos/baabaabet.mov",  // 临时复用
     thumbnailSrc: "/images/baabaabet.png",
     tags: ["SHORT FILM"],
     year: 2024,
   }
   ```
4. 刷新,点击新作品,确认 250ms 平滑过渡
5. 测试完成后移除临时作品,恢复 `works.ts` 单作品状态

- [ ] **Step 5: Commit**

```bash
git add src/components/ImmersiveGallery.tsx
git commit -m "feat(gallery): 1.5s fallback timeout for video crossfade"
```

---

## Task 8: 实现 query string 深链接

**Files:**
- Modify: `src/components/ImmersiveGallery.tsx`

- [ ] **Step 1: 在组件初始化时读取 URL 的 `?w=` 参数**

找到 `useEffect` (处理 initialSlug):

```tsx
useEffect(() => {
  if (initialSlug) {
    setSelectedSlug(initialSlug);
    setLayerASlug(initialSlug);
  }
}, [initialSlug]);
```

替换为:

```tsx
useEffect(() => {
  // 优先从 prop(initialSlug)读取,否则从 URL 查询参数读取
  const fromUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("w")
      : null;
  const slug = initialSlug ?? fromUrl;
  if (slug && works.some((w) => w.slug === slug)) {
    setSelectedSlug(slug);
    setLayerASlug(slug);
  }
}, [initialSlug]);
```

注意:
- `typeof window !== "undefined"` 保护 SSR
- 验证 slug 实际存在于 works 数组中(避免无效输入)
- `initialSlug` 优先(虽然现在没有路由用 prop 传入,但保留扩展性)

- [ ] **Step 2: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

预期:`Compiled successfully`。

- [ ] **Step 3: 手动验证深链接**

```bash
npm run dev
```

测试:
- 打开 http://localhost:3000 — 默认预选第一个作品
- 打开 http://localhost:3000/?w=baabaabet — 应该预选 baabaabet(也是第一个,视觉相同)
- 临时添加第二个作品(同 Task 7 步骤 4),打开 `http://localhost:3000/?w=light-portrait` — 应该直接预选该作品
- 打开 `http://localhost:3000/?w=invalid-slug` — 应该回退到第一个作品,无错误
- 测试完成后移除临时数据

- [ ] **Step 4: Commit**

```bash
git add src/components/ImmersiveGallery.tsx
git commit -m "feat(gallery): query string deep link via ?w=slug"
```

---

## Task 9: 更新 page.tsx 移除 initialSlug prop

**Files:**
- Modify: `src/app/page.tsx`

由于删除了 `works/[slug]` 路由,`initialSlug` prop 永远不会是 `undefined`。但 `ImmersiveGallery` 仍然接受该 prop(向后兼容)。这一步确保 page.tsx 干净。

- [ ] **Step 1: 重读 page.tsx**

确认当前内容:

```tsx
import type { Metadata } from "next";
import { ImmersiveGallery } from "@/components/ImmersiveGallery";

export const metadata: Metadata = {
  title: "全部作品",
  description: "浏览影像作品集,包含短片、实验影像与视觉创作。",
  openGraph: {
    title: "全部作品",
    description: "浏览影像作品集,包含短片、实验影像与视觉创作。",
  },
};

export default function HomePage() {
  return (
    <main className="h-dvh w-full">
      <ImmersiveGallery />
    </main>
  );
}
```

保持不变即可(`initialSlug` 默认 undefined,组件已支持该情况)。无需修改。

- [ ] **Step 2: 验证**

```bash
npm run build 2>&1 | tail -10
```

预期:`Compiled successfully`。

- [ ] **Step 3: 跳过 commit(无变更)**

---

## Task 10: 端到端验证清单

**Files:** 无变更,纯验证

- [ ] **Step 1: 完整 build**

```bash
cd /Volumes/Extension/song52wow/exhibition-works
npm run build 2>&1 | tee /tmp/build.log
```

预期:看到 `Compiled successfully`,无 ESLint 警告,无 TypeScript 错误。

- [ ] **Step 2: 检查 build 日志中的警告**

```bash
grep -i "warn\|error" /tmp/build.log || echo "无警告"
```

预期:`无警告`。

- [ ] **Step 3: 启动 dev server 并执行视觉验证清单**

```bash
npm run dev
```

打开 http://localhost:3000,逐项确认:

| # | 检查项 | 期望 |
|---|---|---|
| 1 | 背景色 | 深棕黑(`#0a0806`) |
| 2 | 视频全屏自动播放 | 是 |
| 3 | 顶部左上 | `◉ REC // N°01`(Cinzel 大写,黄铜金圆点) |
| 4 | 顶部右上 | `SOUND OFF` 按钮(黄铜金描边胶囊) |
| 5 | 底部标题 | Cinzel 大写,浅金色 |
| 6 | 标题下方 | 短金线(40px × 2px) |
| 7 | 年份标签 | 浅金色,大写 |
| 8 | 描述 | Noto Serif SC,浅金色 |
| 9 | 缩略图边 | 黄铜金暗调,选中态亮金 + 微发光 |
| 10 | 缩略图标题 | Cinzel 大写 |

按 Ctrl+C 停止服务器。

- [ ] **Step 4: 移动端验证**

```bash
npm run dev
```

打开 Chrome DevTools,切到 iPhone 12 Pro 视口:
- 缩略图带可横滑
- 标题字号响应式缩小(`clamp(24px, 4vw, 36px)`)
- 顶部 REC 和 SOUND 按钮不重叠

- [ ] **Step 5: 深链接验证**

访问 `http://localhost:3000/?w=baabaabet` — 应预选 baabaabet。
访问 `http://localhost:3000/?w=invalid` — 应回退到第一个作品。

- [ ] **Step 6: 清理**

确认无临时调试代码残留:

```bash
grep -rn "console.log\|debugger" src/
```

预期:无输出。

---

## Task 11: 更新 .gitignore 加入 .superpowers/

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: 添加 .superpowers/ 到 .gitignore**

在 `.gitignore` 末尾追加:

```gitignore
# superpowers brainstorming artifacts (visual companion mockups, etc.)
.superpowers/
```

- [ ] **Step 2: 验证 git status 干净**

```bash
git status
```

预期:无 `.superpowers/` 出现在 untracked files 中。

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorming artifacts"
```

---

## Task 12: 更新 README 反映新结构

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 重写 README.md**

完全替换 `README.md`:

```markdown
# 作品集

基于 Next.js App Router 的个人影像作品集,采用电影感铜黄暗金调视觉风格。

## 快速开始

\`\`\`bash
# 安装依赖(首次)
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run start
\`\`\`

开发服务器默认地址:http://localhost:3000

## 目录结构

\`\`\`
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
\`\`\`

## 添加新作品

1. 将视频文件放入 \`public/videos/\`,例如 \`my-work.mp4\`
2. 将缩略图放入 \`public/images/\`,例如 \`my-work-poster.jpg\`
3. 在 \`src/data/works.ts\` 的 \`works\` 数组中新增一条记录:

\`\`\`ts
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
\`\`\`

## 深链接

通过 query string 预选作品:
- \`/\` — 默认选中第一个作品
- \`/?w=my-work\` — 直接选中指定 slug 的作品

## 设计规格

详见 \`docs/superpowers/specs/2026-06-23-ui-redesign-cinema-style-design.md\`。
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: update README for cinema gold redesign and single-page structure"
```

---

## 验收标准(规格第 6 节回顾)

完成后确认以下 7 项:

1. ✅ 视觉:深棕黑底 + 黄铜金点缀 + Cinzel 大写 + 思源宋体
2. ✅ 沉浸:顶部只有右上角 SOUND OFF + 左上 REC 编号
3. ✅ 切换:点击底部缩略图,250ms 交叉溶解
4. ✅ 深链接:`?w=slug` 直接预选
5. ✅ 响应式:移动端缩略图带横滑,布局正常
6. ✅ 构建:`npm run build` 通过,无 lint 错误
7. ✅ SEO:根页面 metadata 保留,无详情页 metadata

---

## 自审清单

- [x] 规格覆盖:每章节规格都有对应任务
- [x] 占位符扫描:无 TBD/TODO
- [x] 类型一致性:handleLayerBLoaded/useEffect 中变量名一致
- [x] 文件路径精确:所有路径以仓库根 `/Volumes/Extension/song52wow/exhibition-works/` 为基准
- [x] 频繁 commit:每个 Task 都有 commit
- [x] YAGNI:无 framer-motion 等新依赖
- [x] DRY:无重复代码块