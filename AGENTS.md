<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:screenshots-rule -->
# 截图统一入口（Screenshots go here）

所有截图、设计参考图、浏览器导出图、macOS 截屏、Figma 导出都必须存到：

```
docs/screenshots/<topic>/<filename>
```

按主题分子目录，常用三类：

- `docs/screenshots/carousel/`   首页 carousel 各状态截图
- `docs/screenshots/resume/`     简历页截图
- `docs/screenshots/references/` 设计参考图（外部站点、Figma 导出等）

**禁止**把 PNG / JPG / WEBP / GIF 丢到项目根目录或其它任意位置 —— `.gitignore` 已在根目录屏蔽这些扩展名，违规文件不会被追踪。命名建议：英文 ASCII，去空格，可用日期/状态后缀（例如 `frame-1.png`、`japan-travel-2026-07-05.png`）。
<!-- END:screenshots-rule -->
