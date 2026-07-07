# 作品集网站再设计 — Index Wall 方案

**日期**: 2026-07-05
**状态**: 已落地(执行中)
**前置规格**: `2026-06-23-ui-redesign-cinema-style-design.md`(铜黄冷金调,本次整组替换)

---

## 1. 目标与背景

### 1.1 用户诉求
- **整套设计系统换掉**:从铜黄冷金"沉浸单视频"改为更"目录式"的并置展览墙。
- **内容核心**:作品视频为主,名称/描述/链接全部为可选元数据(不强依赖)。
- **空旷感**:当前单视频 + 大面积留白 + 6rem 缩略图带,体感太空。要让首页就有"满"的感觉。
- **尽量在首页完成展示**:不要求 1 屏 fit-all,但用户应在首页直观看完所有作品,无需多页路由翻阅。
- **简历入口**:需要一个能跳转到简历的位置(独立路由,非弹层)。

### 1.2 设计方向(本次)
- **代号**:Index Wall(展览目录索引)
- **气质**:印刷感目录页 / 美术馆作品清单 / 严肃影像展览杂志 —— 不再是 Criterion/A24 单一序章。
- **取舍**:克制 ≠ 空。克制是字号、间距、字距的克制;墙本身的密度可以很高。
- **差异点**:用户能记住的一件事——"首页像翻画册,而不是点开一段预告片"。

---

## 2. 架构

### 2.1 目标文件结构

```
src/
├── app/
│   ├── layout.tsx               改: next/font 接入 Fraunces + Noto Serif SC + JetBrains Mono
│   ├── page.tsx                 保持: 仍渲染 <WorkIndex />
│   ├── globals.css              改: 整套 token(ink × paper × vermilion)+ Wall 排版实用类
│   ├── robots.ts                保持
│   └── resume/
│       └── page.tsx             新: 简历页(印刷感单列)
├── components/
│   ├── ImmersiveGallery.tsx     删
│   ├── SiteHeader.tsx           改: 新头部(品牌 / 编目号 / RESUME 跳转)
│   └── WorkIndex.tsx            新: 整面墙(替代 ImmersiveGallery)
└── data/
    └── works.ts                 保持,字段不动
```

### 2.2 路由
- `/` — 工作墙(默认全显)
- `/?w=<slug>` — 直达某个作品的"焦点态";进入后该作品放大并显示详情条,墙仍在背景
- `/resume` — 简历

### 2.3 持续约束
- 端口 3100(见 `dev-port` 项目记忆)
- `next dev -p 3100` via `npm run dev`
- 不引入 `framer-motion` 之类额外依赖,CSS transition 足够

---

## 3. 视觉系统

### 3.1 色板

```css
:root {
  /* 油墨 × 米色 × 朱砂 */
  --ink:        #0e0c0a;   /* 墨黑底,顶部条 */
  --ink-soft:   #1a1714;   /* 规则线、描边 */
  --paper:      #f1ebde;   /* 米色纸面(主底) */
  --paper-deep: #e3dccd;   /* 投影 / hover 压暗 */
  --text:       #0e0c0a;   /* 主文字颜色, ink 同色(纸底深文字) */
  --text-dim:   #6b6258;   /* 次文字 / 元数据 */
  --stamp:      #c8341d;   /* 朱砂印泥,仅关键信号 */
}
```

**为什么不延用铜黄**:暖金色调在单视频沉浸场景下能撑住气场,但放在多作品并置的"墙"上会变成一片模糊的暖雾(色调 30+ 件展位会过曝)。墨底 × 米底是并置展示的工业标准语言 ——美术馆说明书、画册页、印刷目录都用这套对比。

### 3.2 字体(`next/font/google`)

| 用途 | 字体 | 选用理由 |
|---|---|---|
| Display / 标题 | **Fraunces** | 可变衬线、自带 optical size,比 Cinzel 更"印刷";和中文衬线混排时气质合拍 |
| 中文衬线 | **Noto Serif SC** | 沿用,中文唯一选项 |
| Mono / 编号 | **JetBrains Mono** | 给"N°01 / INDEX 03/03"这类编目编号用,清晰有机器感 |

### 3.3 类型尺度

| 元素 | 字体 | 字号 | 字距 | 样式 |
|---|---|---|---|---|
| Header 品牌 `EXHIBITION WORKS / 作品集` | Fraunces | 13px | -0.01em | 半粗 |
| 编目号 `INDEX 03/03` | JetBrains Mono | 11px | 0.18em | tabular-nums |
| `RESUME →` 链接 | JetBrains Mono | 11px | 0.18em | 大写 |
| 作品标题(英文) | Fraunces | clamp(28px, 3.5vw, 56px) | -0.02em | — |
| 作品标题下划线 | — | 1px | — | `--ink-soft` 实线 |
| 年份 / tags | JetBrains Mono | 10px | 0.2em | 大写 |
| 描述 | Noto Serif SC | 14-15px | 0 | leading-relaxed |
| 角落编号 `N°01` | JetBrains Mono | 11px | 0.2em | 大写,tablet-shape |

---

## 4. 页面与组件

### 4.1 WorkIndex(主页核心)

```
┌──────────────────────────────────────────────────────┐
│ EXHIBITION WORKS    作品集        03/03     [RESUME →]│  ← SiteHeader, sticky
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────────────────┐  ┌─────────────┐       │
│   │      ▶ CUPC ORACLE      │  │  ▶ 作品 #2  │       │
│   │   N°01  AI · 2026       │  │   N°02      │       │
│   └─────────────────────────┘  └─────────────┘       │
│                                                      │
│   ┌─────────────────────────────────────────────┐    │
│   │      ▶ BAABAA BET (全宽)                    │    │
│   │      N°03   WEB3 · 2025                     │    │
│   └─────────────────────────────────────────────┘    │
│                                                      │
│   (对应数字 cell-span 模式:7/5/12 — 不对称节奏)         │
└──────────────────────────────────────────────────────┘
```

**布局规则**
- 12-col CSS grid,desktop `gap-6`,mobile `gap-4`
- 不对称:cell-span 序列按作品数 `works.length` 与作品索引 `i` 计算:
  - works 长度 ≤ 3 时:`[7,5,12]`(并置前 2,最后 1 横跨)
  - works 长度 4 时:`[6,6,6,12]` 再加一条
  - 通用 fallback:`[12] * n`(全宽堆叠,极端稳态)
- 每个作品卡:`aspect-video`(默认 16:9),但如果视频自身比例不同,允许溢出到原生宽高比(`object-cover` 裁切)
- 角落:
  - 左上 `N°01`(墨色框 + 米色字)
  - 左下标题(只显第一个单词或缩写,hover/焦点态展开全名)
  - 右上 metadata 单一 chip:year 或第一个 tag
- hover:视频自动播放(muted→有声分级),cell 微抬 `translateY(-4px)`,叠加 1px vermilion 描边
- 点击:`/?w=<slug>` 路由更新,作品进入"焦点态"

**焦点态(替代原 ImmersiveGallery 主角逻辑)**
- 路由:`/?w=<slug>`(深链保留)
- 行为:整面墙不消失,被选中的 cell 升级为 sticky 顶部条 + 放大视频 + 详情条
- 详情条:title + 描述 + tags + (若有)外链 → 在滚动到底时变成 sticky 顶条,仍能看到墙内其他作品的缩略
- 关闭焦点:点视频上的 ✕ 按钮,`router.push('/')`

### 4.2 SiteHeader

```
┌──────────────────────────────────────────────────────┐
│ EXHIBITION WORKS / 作品集        03/03     RESUME →   │
└──────────────────────────────────────────────────────┘
```

- sticky top,米色底 + 1px bottom rule
- 左:品牌(英文在上,中文在下,11/10 px)
- 中:当前显示索引(可选,默认 `INDEX 03/03`)
- 右:`RESUME →` 跳转 `/resume`,hover 时 vermilion underline

### 4.3 /resume 页面

```
EXHIBITION WORKS · RESUME                    ⟵ 返回首页

[名字 / Name]
[一句 tagline]

─── 工作 ───
2026 — Now   公司 / 角色
                 · bullet · bullet
2024 — 2026  ...

─── 技能 ───
清单

─── 联系方式 ───
● email
● github
```

- 单列,`max-w-[640px]` 居中
- 用 Fraunces 做名字,Fraunces caption 做章节名(全大写 + 0.18em)
- 每行 + 1px ink-soft 横线做 separator

---

## 5. 动效

- hover 视频:fade in 200ms + 微抬
- cell 焦点态进入:Tailwind `data-[focused=]:` 切换样式,无 framer-motion
- header sticky 出现时:`transition: box-shadow 200ms` 添加 1px ink-soft 1px bottom rule 显示
- 全站禁掉"全黑淡入"过渡,保持墙永远在场

---

## 6. 元数据

- `layout.tsx.metadata.title`: `作品集 / EXHIBITION WORKS`
- `layout.tsx.metadata.description`: 强调 Index 形态:`个人影像作品索引 · Index of moving-image works.`
- `metadataBase`: `NEXT_PUBLIC_SITE_URL`(已有)
- 删除 `ImmersiveGallery` 之后再无 `useRouter` 客户端依赖做 URL state,但 `WorkIndex` 仍需要(读 `?w=` 与 push)

---

## 7. 错误处理

| 场景 | 行为 |
|---|---|
| `?w=invalid-slug` | 焦点态不激活,墙正常显示,无 console error |
| 视频 404 | 显示 `poster` 静帧,hover 仍触发 |
| 视频解码失败 | poster + console.warn,切焦点态正常 |
| `works.ts` 空 | WorkIndex 返回 `null`,渲染空状态 |
| 网络盘 Turbo 慢 | 已有提示,使用 `NEXT_TURBOPACK_CACHE_DIR=/tmp/next-cache` 缓解 |

---

## 8. 性能与可访问性

- 视频仅在 hover 范围内预热(`preload="metadata"`),首次不强制 `auto`
- `<video muted>` 默认静音,首次交互后允许 unmute
- 关键 CTA 保留 `aria-label`、`aria-current` / `aria-pressed`
- 颜色对比度:ink `#0e0c0a` 对 paper `#f1ebde` ≈ 17:1(远超 WCAG AAA)
- 用 `prefers-reduced-motion` 关掉 cell 微抬

---

## 9. 测试策略

- `npm run build`(类型 + ESLint)
- `curl http://localhost:3100/` 返回 200
- `curl http://localhost:3100/resume` 返回 200
- `curl http://localhost:3100/?w=cuporacle` 返回 200
- 浏览器截图:取一张首页截图,确认墙上能看到 ≥ 3 个视频海报并置

---

## 10. 不做的事

- 不引入新依赖
- 不增加新的全局组件库
- 不重写 `works.ts` 数据结构
- 不动 `next.config.ts`
- 不做国际化
- 不在 `/resume` 接入 PDF 导出(只在打印 CSS 下尽量排版漂亮)

---

## 11. 实施步骤

1. 删 `ImmersiveGallery.tsx`,改写为 `WorkIndex.tsx`
2. 改 `layout.tsx`:`next/font/google` 引入三套字;移除 `overflow-hidden`
3. 重写 `globals.css`:ink/paper/vermilion tokens + `@theme inline` 映射
4. 新 `SiteHeader.tsx`:品牌 + INDEX 编号 + RESUME 链接
5. 新 `app/resume/page.tsx`:单列印刷感简历
6. `app/page.tsx` 换渲染 `<SiteHeader />` + `<WorkIndex />`
7. `npm run build` 验证
8. 浏览器/curl 验证三条路由
