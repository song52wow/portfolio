# 作品集网站 UI 重设计 — 电影感暗金调

**日期**: 2026-06-23
**状态**: 设计稿待用户最终确认
**路径**: `docs/superpowers/specs/2026-06-23-ui-redesign-cinema-style-design.md`

---

## 1. 目标与背景

将现有的"作品集"网站(`exhibition-works`)从通用暗色风格升级为**电影感 · 铜黄冷金调**,使其具备 Criterion Collection / A24 类型的严肃影像作品集气质。保留单页沉浸式画廊的交互骨架,只重做视觉调性、字体、配色、动效。

### 设计方向(用户确认)
- **风格**: 电影感 · 铜黄冷金调(暗金 B 方向)
- **字体**: Cinzel(英文大写罗马雕刻体)+ Noto Serif SC(中文衬线)
- **作品信息**: 始终可见 · 底部面板
- **缩略图导航**: 横向缩略图带(当前形式,样式升级)
- **顶部信息**: 只保留右上角取消静音按钮,左上角加 `◉ REC // N°xx` 实时编号
- **切换动效**: 200-300ms 交叉溶解
- **详情页**: 不需要,单页全沉浸;深链接通过 query string `?w=slug`

### 现有问题
1. `SiteHeader`、`WorkCard`、`VideoPlayer` 三个组件是孤儿代码,从未被任何页面引用
2. 颜色是通用锌灰 (`zinc-950`),字体是 Geist Sans/Mono,与影像作品集气质不符
3. 没有真正的视频交叉溶解,切换是硬切
4. `works/[slug]` 详情页与首页几乎相同,但占用了路由和 SEO 配置

---

## 2. 架构

### 2.1 文件结构(目标态)

```
src/
├── app/
│   ├── layout.tsx              改: 引入 Cinzel + Noto Serif SC,铜黄主题变量
│   ├── page.tsx                保持
│   ├── globals.css             改: 铜黄调色板、Cinzel 工具类、video crossfade 类
│   ├── sitemap.ts              删(只有根 URL,不需要动态 sitemap)
│   ├── robots.ts               保持
│   └── works/
│       └── [slug]/             删(整个目录)
├── components/
│   └── ImmersiveGallery.tsx    重写
└── data/
    └── works.ts                保持(只有 1 个真实作品 + 必要的占位)
```

### 2.2 删除项
- `src/components/SiteHeader.tsx`
- `src/components/WorkCard.tsx`
- `src/components/VideoPlayer.tsx`
- `src/app/works/[slug]/page.tsx` 及整个 `[slug]` 子目录
- `src/app/sitemap.ts`

### 2.3 保留项
- `src/app/layout.tsx`(修改字体和颜色变量)
- `src/app/page.tsx`(基本不变,仍渲染 `<ImmersiveGallery />`)
- `src/app/robots.ts`
- `src/app/globals.css`(大幅重写)
- `src/components/ImmersiveGallery.tsx`(重写)
- `src/data/works.ts`(基本不变)

---

## 3. 视觉系统

### 3.1 色板(CSS 变量,在 `globals.css` 定义)

```css
:root {
  --background: #0a0806;       /* 深棕黑底 */
  --surface:    #14110d;       /* 面板底(用于底部信息区背景或可选阴影) */
  --border:     #2a2520;       /* 描边 */
  --gold:       #b8860b;       /* 黄铜金(主点缀、选中态) */
  --gold-soft:  #cd9b3a;       /* 黄铜金(hover) */
  --gold-pale:  #6b5418;       /* 黄铜金(暗调/背景) */
  --text:       #e6dec5;       /* 浅金主文字 */
  --text-dim:   #8a7d5f;       /* 浅金次文字(年份、标签) */
  --text-mute:  #5a5142;       /* 浅金最弱文字(占位、disable) */
}
```

### 3.2 字体

通过 `next/font/google` 引入:
- `Cinzel` — 大写罗马雕刻体,用于品牌、编号、英文标题
- `Noto Serif SC` — 中文衬线,用于描述、年份、中文作品名(若有)
- `Geist` / `Geist Mono` — 仅作为 fallback,实际不主动使用

### 3.3 字距与字号规范

| 元素 | 字体 | 字号 | 字距 | 样式 |
|---|---|---|---|---|
| 顶部 `◉ REC // N°01` | Cinzel | 10px | 0.35em | 大写 |
| 顶部 `SOUND OFF` 按钮 | Cinzel | 10px | 0.3em | 大写 + 黄铜金描边胶囊 |
| 作品标题(英文) | Cinzel | 28-32px | 0.2em | 大写 |
| 年份 | Noto Serif SC | 11px | 0.3em | — |
| 标签 | Cinzel | 10px | 0.15em | 大写 + 黄铜金 1px 描边(替代填充胶囊) |
| 描述 | Noto Serif SC | 14px | normal | leading-relaxed |
| 缩略图标题 | Cinzel | 10px | 0.1em | 大写 |

---

## 4. ImmersiveGallery 组件设计

### 4.1 整体布局

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ◉ REC // N°01              [ SOUND OFF ]  ← 顶  │
│                                                  │
│           [全屏视频,250ms 交叉溶解切换]            │
│                                                  │
│                                                  │
│   ▎ GOLD LINE  ← 装饰细线                          │
│   LIGHT                                          │
│   PORTRAIT                                       │
│   ────                                            │
│   2024 · 短片 · 8 分钟                            │
│   夜色中的肖像,镜头缓缓推近,光在脸上流淌。        │
│                                                  │
│   ─────────────────────────────────────────────  │
│   [缩略图] [缩略图] [缩略图] [缩略图] →            │
└──────────────────────────────────────────────────┘
```

### 4.2 关键变更点(对比当前实现)

| 区域 | 当前 | 重设计 |
|---|---|---|
| 顶部左上 | 中文"作品集"链接 | `◉ REC // N°01`(纯展示,非链接) |
| 顶部右上 | 中文"点击开启声音"按钮(铜灰色描边胶囊) | `SOUND OFF` 胶囊(Cinzel 大写 + 黄铜金描边) |
| 视频层 | 单 `<video>` 元素,硬切 | 双 `<video>` 层叠,250ms 交叉溶解 |
| 底部面板背景 | `bg-zinc-950/75` + 毛玻璃 | 透明 + 顶部 1px 黄铜金细线 |
| 作品标题 | Geist 18-20px | Cinzel 大写 28-32px |
| 标题装饰 | 无 | 标题下方 2px 黄铜金线(40px 宽) |
| 年份 | Geist 14px 锌灰 | Cinzel/Noto Serif SC 11px 浅金 |
| 标签 | 填充灰胶囊 | 描边胶囊(1px 黄铜金边 + 透明底) |
| 描述 | Geist 14px 锌灰 | Noto Serif SC 14px 浅金 |
| 缩略图边框 | 透明 | 1px 黄铜金暗调 `#6b5418` |
| 缩略图选中态 | 锌白边 + scale + 阴影 | 黄铜金实线 + 微弱金色外发光(无 scale/无阴影) |
| 缩略图标题 | Geist 10-12px | Cinzel 大写 10px |

### 4.3 顶部 `◉ REC // N°xx`

- 固定位置:`absolute top-6 left-6`
- 格式:`◉ REC // N°01`,其中 `01` 是当前作品的索引(从 1 开始),左 padding 为两位数
- `◉` 为红色实心圆(`#c0392b` 或 `--gold-soft`)表示录制中指示灯效果
- 当选中作品改变时,数字平滑过渡(简单 tween 或直接切换,因为它很快)

### 4.4 标签胶囊(替代填充胶囊)

```html
<span class="border border-[var(--gold)] px-2.5 py-0.5
             text-[10px] tracking-[0.15em] uppercase
             text-[var(--gold-soft)] font-[family-name:var(--font-cinzel)]">
  SHORT FILM
</span>
```

### 4.5 缩略图带

- 容器:`overflow-x-auto`,间距 `gap-3`,内边距 `px-4 py-3`(移动)/ `px-6 py-4`(桌面)
- 每张缩略图:
  - `h-[4.5rem] w-[5.5rem]`(移动)/ `h-[5rem] w-[6.5rem]`(桌面)
  - 边框:`1px solid var(--gold-pale)`,圆角 `0.375rem`
  - 选中态:`border-color: var(--gold)`,外发光 `box-shadow: 0 0 0 1px var(--gold-soft), 0 0 12px rgba(184, 134, 11, 0.25)`
  - 取消 scale,取消阴影
- 缩略图标题:绝对定位在底部,渐变蒙版 + Cinzel 大写
- 滚动行为:`snap-x snap-mandatory`,选中时 `scrollIntoView({inline: 'center'})`

---

## 5. 交叉溶解动效实现

### 5.1 双视频层技术

ImmersiveGallery 维护两个 `<video>` 元素:
- **layerA**:当前播放的作品
- **layerB**:下一作品(切换时)

```tsx
type VideoLayer = { slug: string; el: HTMLVideoElement | null };

const [layerA, setLayerA] = useState<VideoLayer>({ slug: current, el: null });
const [layerB, setLayerB] = useState<VideoLayer | null>(null);
const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');

const selectWork = useCallback((nextSlug: string) => {
  if (nextSlug === layerA.slug) return;

  setLayerB({ slug: nextSlug, el: null });

  // 当 layerB 视频 loadeddata 后:
  //   1. setActiveLayer('B') (CSS 触发 opacity 切换)
  //   2. 250ms 后:
  //        - layerA 替换为旧 layerB 的视频
  //        - setLayerB(null)
  //        - 更新 URL
}, [layerA.slug]);
```

### 5.2 CSS 类

```css
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

### 5.3 切换时序

1. `t=0ms`: 用户点击,`setLayerB({slug: next})`
2. `t=0~Nms`: layerB 的 `<video>` 加载,监听 `loadeddata` 事件
3. `t=Nms`: `setActiveLayer('B')` → CSS 触发 250ms opacity 0→1,同时 layerA opacity 1→0
4. `t=N+250ms`: 过渡完成,`layerA = layerB`,`setLayerB(null)`,URL 更新为 `?w=nextSlug`
5. 自动播放:`layerB.play()` 在 `loadeddata` 时触发;若浏览器策略阻止,保留 muted 状态(默认)

### 5.4 降级策略

- 若 `loadeddata` 超过 1.5s 未触发,降级为硬切(直接替换 layerA,跳过动画)
- 若只有 1 个作品,无 layerB,无切换

---

## 6. URL 深链接

### 6.1 格式

- 主页:`/`(默认选中第一个作品)
- 深链接:`/?w=<slug>`(直接打开并预选该作品)

### 6.2 实现

```tsx
// 在 ImmersiveGallery 中
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const w = params.get('w');
  if (w && works.some(work => work.slug === w)) {
    selectWork(w, { skipUrlUpdate: true });
  }
}, []);

const selectWork = (slug, opts) => {
  // ...切换逻辑
  if (!opts?.skipUrlUpdate) {
    router.replace(`/?w=${slug}`, { scroll: false });
  }
};
```

### 6.3 SEO 影响

- 删除 `works/[slug]` 详情页后,sitemap 仅保留根 URL
- `metadata.title.template` 移除(没有子页面使用),根 metadata 直接使用 `title: '作品集'`

---

## 7. 错误处理

| 场景 | 行为 |
|---|---|
| `?w=invalid-slug` | 静默回退到第一个作品,不抛错 |
| 视频文件 404 | 显示 `poster` 图作为静态背景,无限循环(无视频层) |
| 视频解码失败 | 显示 poster,console.warn,不打断切换 |
| `works.ts` 为空 | ImmersiveGallery 返回 `null`,不渲染 |
| 浏览器不支持 `next/font` | 降级到 fallback 字体(`serif`) |

---

## 8. 性能与可访问性

### 8.1 性能
- 视频 `preload="auto"`(为 autoplay 服务)
- 切换时旧 video 立即 `pause()` 并 `removeAttribute('src')` 释放内存
- Image 组件保持 `sizes` 属性和 `priority` 仅对第一个缩略图

### 8.2 可访问性
- 所有交互元素保留 `aria-label`(已存在)
- 选中态用 `aria-current="true"`(已存在)
- 颜色对比度:浅金 `#e6dec5` 对深棕黑 `#0a0806` ≥ 11:1(达标)
- SOUND OFF 按钮加 `aria-pressed`
- 缩略图标题文字(`alt=""` 已存在,文字叠加是补充)

---

## 9. 测试策略

### 9.1 自动化(可选)
- `npm run build` 通过(类型 + ESLint)
- 无新增测试用例(项目当前无测试基础设施,本次为纯视觉重设计,优先保证构建通过)

### 9.2 手动验证清单
- [ ] 打开 `/`,看到深棕黑底 + 黄铜金点缀 + Cinzel 大写标题
- [ ] 视频自动播放并填满屏幕
- [ ] 点击底部缩略图,250ms 交叉溶解切换到新作品
- [ ] 顶部右上 SOUND OFF 按钮可点击并切换状态
- [ ] 顶部左上编号随选中作品变化
- [ ] 访问 `/?w=baabaabet` 直接打开并预选该作品
- [ ] 访问 `/?w=invalid` 回退到第一个作品
- [ ] 移动端(375px 宽):缩略图带可横滑,布局正常
- [ ] `npm run build` 通过,无 lint 错误

---

## 10. 范围之外(明确不做)

- 不引入新依赖(framer-motion、lottie 等)
- 不拆分多个组件(单一 ImmersiveGallery)
- 不重新设计 `works.ts` 数据结构
- 不改变 Next.js 配置(`next.config.ts`、`tsconfig.json`)
- 不添加国际化(`i18n`)框架
- 不添加作品详情页或独立路由

---

## 11. 实施步骤概要(供 writing-plans 技能展开)

1. 删除孤儿文件和孤儿路由
2. 在 `layout.tsx` 引入 Cinzel + Noto Serif SC 字体
3. 在 `globals.css` 定义铜黄调色板和字体类
4. 重写 `ImmersiveGallery.tsx`:双视频层交叉溶解、Cinzel 标题、铜黄样式、query string 深链接
5. 调整 `works.ts`:只保留必要数据
6. 运行 `npm run build` 验证
7. 手动验证清单逐项确认

---

## 12. 待用户最终确认事项

本规格已涵盖所有讨论的设计决定。用户已两次表示"实施"。最终确认点:
1. 删除 `works/[slug]` 路由(替换为 query string 深链接)
2. 标签改为黄铜金描边胶囊(替代当前填充胶囊)
3. 删除 `SiteHeader`/`WorkCard`/`VideoPlayer` 三个未使用组件

如果以上三点都 OK,即可进入 writing-plans 阶段。