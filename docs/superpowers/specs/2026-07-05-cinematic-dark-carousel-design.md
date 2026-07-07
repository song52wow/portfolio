# 作品集网站再设计 · Cinematic Dark Carousel

**日期**: 2026-07-05
**状态**: 进行中（替换 Index Wall）
**前置规格**: `2026-07-05-redesign-index-wall-design.md`（整体替换）
**触发参考图**: `docs/screenshots/references/japan-travel-2026-07-05.png`（Japan 旅游站点参考）
**忽略项**: 参考图最底部 "Scenic Railway • Lantern Festival • Coastal Villages • Historic Streets" 一行

---

## 1. 目标与背景

### 1.1 用户诉求
- **完全替换当前的 Index Wall 印刷感风格**为参考图中的 cinematic 旅行杂志风格。
- **布局形态改为 carousel**：参考图为"一次一个目的地"的剧场化浏览；当前网站的"一次看完全部"墙被替换。
- 焦点态（`?w=<slug>`）仍保留为可深链入口。

### 1.2 设计方向
- **代号**: Cinematic Dark Carousel
- **气质**: 编辑型旅行杂志 + 夜间电影感 — 深紫黑底 + 暖朱红 accent + 现代无衬线巨字
- **取舍**: 单作品为主角（cinematic hero 占满首屏），其他作品为右下角缩略卡
- **差记忆点**: "首页不是目录页,而是一段 travel film"

---

## 2. 架构

### 2.1 文件结构

```
src/
├── app/
│   ├── layout.tsx               改: next/font → Bricolage_Grotesque + Manrope + Noto_Sans_SC + JetBrains_Mono
│   ├── page.tsx                 保持: 渲染 <SiteHeader /> + <WorkIndex />
│   ├── globals.css              改: night/twilight/ember tokens, 玻璃胶囊, cinematic gradient, grain overlay
│   ├── robots.ts                保持
│   └── resume/
│       └── page.tsx             改: 暗底版简历(与 hero 同视觉语言)
├── components/
│   └── SiteHeader.tsx           改: 玻璃胶囊浮动 + J logo + 横排 + 搜索/Menu/apps 圆按钮
│   └── WorkIndex.tsx            重写: CinematicCarousel(Timeline + Centerpiece + ThumbnailStack + PagerControls)
└── data/works.ts                保持
```

### 2.2 路由
- `/` — Cinematic Carousel,自动 8s 切换,首屏即可左右浏览
- `/?w=<slug>` — 直达定位到该作品 + 暂停自动播放
- `/resume` — 暗底简历页(视觉同化)

### 2.3 持续约束
- 端口 3100(见 `dev-port` 项目记忆)
- 不引入 framer-motion 等额外依赖
- 不改 works.ts 数据结构
- 不动 next.config.ts

---

## 3. 视觉系统

### 3.1 色板

```css
:root {
  /* cinematic night */
  --night:           #0a0814;   /* 深紫黑底 */
  --twilight:        #1f1330;   /* 暗紫 */
  --ember:           #f15a4a;   /* 珊瑚朱 — primary accent */
  --ember-soft:      #d65635;   /* 日落暖橙(hover 态) */
  --paper-on-night:  #f4ecd9;   /* 暖白文字(避免纯白过冷) */
  --mute-on-night:   #8c8094;   /* 次文字 — 紫灰 */
  --ink-soft:        #2a2030;   /* 在夜底上的淡描边 */
}
```

替代原 `--ink / --paper / --stamp` 三元组。

### 3.2 字体(next/font/google)

| 用途 | 字体 | 选型理由 |
|---|---|---|
| Display / 巨字标题 | **Bricolage Grotesque** | variable grotesque,现代 editorial 气质,巨字端气质接近截图"Japan" |
| 正文 / 卡标签 | **Manrope** | variable, 干净几何无衬线 |
| 中文 | **Noto Sans SC** | 替代原 Noto Serif SC,与新方向一致(无衬线) |
| Mono / 编号 | **JetBrains_Mono** | 沿用,编目编号风格清晰 |

### 3.3 类型尺度

| 元素 | 字体 | 字号 | 字距 |
|---|---|---|---|
| 巨字标题(`works[i].title`) | Bricolage Grotesque 700 | clamp(72px, 12vw, 220px) | -0.04em, line-height 0.92 |
| tagline / 描述 | Manrope 400 | 15px | normal |
| 导航条目 | Manrope 500 | 11px, uppercase, 0.18em tracking | — |
| 编目号 `INDEX / 03` | JetBrains Mono | 11px | 0.18em |
| 缩略卡标题 | Bricolage 500 | 18px | -0.02em |

---

## 4. 页面与组件

### 4.1 CinematicCarousel(<WorkIndex />)

整体 `100dvh` 一屏,内部 6 区:

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◀  [⌬ pill]  Works · About · Resume · Contact  [⌕] [Menu] [⛶] ▶    │  ← 顶部玻璃胶囊(固定)
│                                                                       │
│ ┌─┐                                                                  │
│ ●  │                                                ┌─────────────┐ │
│ ┆  │  BaaBaaBet                                     │ ▶ 缩略卡 2  │ │
│ ┆  │  Web3 prediction DApp                          ├─────────────┤ │
│ ●  │  ── 2025                                       │ ▶ 缩略卡 3  │ │
│ ┆  │  [ Explore → ]                                 └─────────────┘ │
│ ┆  │                                                                  │
│ ○  │                                                                  │
│                                                                       │
│                                                                       │
│  [↓ Scroll to discover]       [ ← ]  [ → ]              01 / 05       │
└──────────────────────────────────────────────────────────────────────┘
```

**区说明:**
- **顶部**: `<SiteHeader />` 玻璃胶囊,fixed top + 1px white/12 边框 + backdrop-blur(14px)
- **左 4%**: `<VerticalTimeline />` 垂直时间线 — N 个圆点(works.length),active = 大号朱红实心 + 上下细线
- **中央偏左 38%**: `<Centerpiece />` 当前作品的巨字标题 + tagline + 朱红药丸 CTA(`/?w=slug`)
- **右侧 38%**: `<ThumbnailStack />` 其他作品的堆叠缩略卡(最多 3 张)
- **底部 8%**: 左 = ↓ 圆按钮 + "Scroll to discover"; 中 = ←/→ 圆按钮; 右 = `01/05` 进度

**背景层**: 当前作品的 `thumbnailSrc` 直接用作全屏 backdrop(<Image fill,object-cover,opacity 0.55),叠 cinematic 渐变 `radial-gradient(ellipse at 30% 40%, transparent 0%, rgba(10,8,20,0.6) 50%, rgba(10,8,20,0.95) 100%)` + 全屏 SVG grain 噪点(opacity 0.06)。背景随 carousel 切换 crossfade。

### 4.2 切换交互
- 底部 ←/→ 圆按钮 / 键盘 ←→ / 时间线节点 click / 缩略卡 click → 切换
- 自动播放 8s/次,hover 暂停,任何手动操作重置计时器
- 进入焦点态 `?w=<slug>` → 自动跳到该作品并暂停;ESC 退出焦点态回到 `/?`

### 4.3 焦点态(替代 FocusOverlay)
- 路由进入后:carousel 锁定到该作品 + 暂停自动播放
- 弹出焦点层(替换原 FocusOverlay):hero 放大为 70vh 视频区 + 左侧详情条(title + description + tags + ESC close);背景暗化 90%
- 顶部导航仍可见,可点击关闭回到主 carousel

### 4.4 <VerticalTimeline />
- 容器:左 4% 宽 + 全高 padding,flex-col,justify-center
- N 节点(walks.length):fixed 圆点 + 上下细竖线
- active 节点: 14px 朱红实心圆 + 上下各 1.5px 朱红短线
- 非 active 节点: 6px 半透明白 + 上下 1px white/20 细线
- hover 节点:鼠标移上去显示该作品的 title 气泡 preview

### 4.5 <ThumbnailStack />
- 右下绝对定位,最多 3 张卡,flex-col
- 每张卡:`aspect-[3/4]`(竖版海报感),封面图 + 底部渐变 + 作品名 + 年份 tag
- active 卡片消失(因为当前在中央)
- 非 active 卡:小尺寸 `w-[140px]`,hover 时 `w-[160px]` + 朱红 1.5px border + tilt 3D
- click 卡 → 跳到该作品

### 4.6 <Centerpiece />
- 巨字标题 = 当前 work.title,白字带极轻微 letter-spacing
- 标题下面是 work.description(精简到一句 tagline)
- CTA 按钮 = 朱红药丸,内嵌圆形箭头 → 跳 `/?w=slug`

### 4.7 SiteHeader(玻璃胶囊)
```
[ ⌬ J ]  [ Works  About  Resume  Contact ]  [ ⌕ ]  [ Menu ]  [ ⛶ ]
```
- 整个容器:`glass-pill` 样式,固定顶部 inset-x-0 top-5,z-40
- 胶囊:`rounded-full,h-14,bg-white/4,backdrop-blur(14px),border 1px white/12`
- 左圆 J logo:`w-9 h-9 rounded-full bg-ember` 白色文字"J"
- 中横排菜单:11px uppercase tracking
- 右三按钮:圆 search 按钮 + Menu 药丸文字按钮 + 圆 apps grid 按钮

### 4.8 /resume 暗底版
- 沿用 cinematic 色板:`bg-night`
- 单列 `max-w-[680px]`,Fraunces 大字名字(Fraunces 也可作为次字呈现)
- 章节用 Manrope uppercase 11px + 0.18em tracking
- 每节末尾 1px `ink-soft` 细横线 separator
- 顶部仍可见固定胶囊导航

---

## 5. 动效

- 切换作品:`opacity + transform: translateX(±40px)` crossfade 600ms cubic-bezier(.65,0,.35,1)
- 自动播放 timer:8s,通过 `useEffect + setInterval`,hover/手动操作重置
- 巨字入场:`@keyframes` 标题与 description 各延迟 100ms,800ms ease-out
- 缩略卡 hover: mousemove 时 `rotateX(±3deg) rotateY(±3deg)`(perspective 1000px)
- CTA hover: 背景 `--ember → --ember-soft` + translateY(-2px) + 朱红 glow shadow
- 时间线 hover: 节点放大 1.5× + 出现该作品的 title 预览
- 全站禁用整屏淡入黑幕

---

## 6. 元数据

- `layout.tsx.metadata.title`: `作品集 / EXHIBITION WORKS`
- `layout.tsx.metadata.description`: `个人影像作品索引 · Index of moving-image works.`
- 不动其他 metadata

---

## 7. 错误处理

| 场景 | 行为 |
|---|---|
| `?w=invalid-slug` | 自动跳到 index=0,无 console error |
| 视频 404 | 显示 poster 静帧,切换功能正常 |
| 视频解码失败 | poster + console.warn,聚焦正常 |
| `works.ts` 空 | Carousel 显示 "No works yet" 占位 |
| Turbopack 慢 | 已有提示,使用 `NEXT_TURBOPACK_CACHE_DIR=/tmp/next-cache` |

---

## 8. 性能与可访问性

- 背景图 `priority`(carousel 第一帧),其他卡 `loading="lazy"`
- `<video muted playsInline loop preload="none">` 仅在 active 时预热
- 关键 CTA 保留 `aria-label`、`aria-current`、`aria-live`
- 颜色对比度:paper-on-night `#f4ecd9` 对 night `#0a0814` ≈ 15:1(超 WCAG AAA)
- `prefers-reduced-motion` 关掉自动播放与 crossfade transform

---

## 9. 测试策略

- `npm run build`(类型 + ESLint)
- `curl http://localhost:3100/` = 200
- `curl http://localhost:3100/?w=cuporacle` = 200
- `curl http://localhost:3100/resume` = 200
- 浏览器截图:carousel 每个 active 状态各 1 张

---

## 10. 不做的事

- 不引入新依赖
- 不重写 `works.ts` 数据结构
- 不动 `next.config.ts`
- 不做国际化
- 不做简历 PDF 导出

---

## 11. 实施步骤

1. 改 `globals.css`:night/twilight/ember tokens + 玻璃胶囊 + cinematic 渐变 + grain
2. 改 `layout.tsx`:换字体(next/font/google)为 Bricolage + Manrope + Noto Sans SC + JetBrains Mono
3. 重写 `SiteHeader.tsx`:玻璃胶囊浮动
4. 重写 `WorkIndex.tsx`:CinematicCarousel
5. 改 `app/resume/page.tsx`:暗底版本
6. `npm run build` 验证
7. curl 三路由 + 浏览器截图

---

## 12. 关键决策记录

| 决策点 | 选定 | 理由 |
|---|---|---|
| 背景层 | **作品原图(thumbnailSrc)** | 默认简洁可控,无需额外工序 |
| 自动播放 | **开 8s/次,hover 暂停** | 复刻截图"01/05 翻页"剧场感 |
| 时间线节点数 | **自适应 works.length** | 当前仅 3 件,固定 6 会留空 |
| 切换动画 | **slide + crossfade** | 6 区同时切换不撕裂 |
| 简历页 | **暗底同化** | 视觉系统统一品牌 |
