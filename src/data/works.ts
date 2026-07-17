export type Work = {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Short bullet lines that expand under the description on hover.
   *  Each line is one technical contribution — kept short so the
   *  expanded panel reads like a mini-stack-list, not a paragraph. */
  highlights?: string[];
  videoSrc: string;
  videoMp4Src?: string;
  thumbnailSrc: string;
  tags?: string[];
  year?: number;
  /** When set, the Explore CTA opens this URL in a new tab instead of
   *  scrolling within the carousel. Use for live-deployed products. */
  externalUrl?: string;
};

/* basePath is injected at build time via NEXT_PUBLIC_BASE_PATH (see
 * next.config.ts → `env`). Next.js's basePath only auto-prefixes
 * <Link>/router-managed URLs; raw strings used in <video>, <source>,
 * and <Image src> are NOT prefixed. Inlining the prefix here keeps the
 * data file as the single source of truth for asset paths.
 *  - In dev: ""  → /videos/foo.mp4
 *  - In prod (GitHub Pages at /portfolio): "/portfolio" → /portfolio/videos/foo.mp4 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Display order matches the resume: newest project first, oldest last.
 *  - CupOracle: 2026.06 — ongoing
 *  - Pump:      2024.08 — 2026.01
 *  - Extension Purse: 2024.08 — 2024.11  (X/Twitter AI annotator)
 *  - BaaBaaBet: 2022.05 — 2023.06        (Web3 prediction DApp) */
export const works: Work[] = [
  {
    id: "1",
    slug: "cuporacle",
    title: "世界杯 AI 预测展示平台",
    description:
      "面向 2026 世界杯正赛的 AI 胜率预测仪表盘，多模型并行推理，部署在 Cloudflare 全栈生态。",
    highlights: [
      "Next.js 14 App Router + RSC + Edge Runtime，rewrites 代理消除跨域",
      "Cloudflare Workers (Hono) + D1 后端架构，Mock fallback 保障冷启动开发体验",
      "OpenAI 兼容多模型并行：DeepSeek / GLM / MiMo / MiniMax",
      "LLM_PREDICTION_MODELS 环境变量灵活切换预测引擎",
    ],
    videoSrc: `${BASE}/videos/cuporacle.mov`,
    videoMp4Src: `${BASE}/videos/cuporacle.mp4`,
    thumbnailSrc: `${BASE}/images/cuporacle.png`,
    tags: ["AI", "PREDICTION", "NEXT.JS 14", "CLOUDFLARE", "D1", "HONO", "ECHARTS"],
    year: 2026,
    externalUrl: "https://cuporacle.xyz/",
  },
  {
    id: "2",
    slug: "pump",
    title: "去中心化代币启动平台",
    description:
      "基于 Base 网络的去中心化代币启动平台，文化币 / Meme 币无许可发行与交易，PC + 钱包内 DApp 双端访问。",
    highlights: [
      "五大核心路由：CreateToken / TradingToken / MyDataToken / Exit / 发现",
      "Farcaster MiniApp SDK 自动切换 PC 端 ↔ 钱包内 DApp",
      "TradingView 自定义 + 实时 WebSocket 行情 + ECharts 双引擎",
      "ethers v5 + viem + viem/Privy 双栈合约调用",
      "TypeChain + GenAPI 自动生成类型化合约与 HTTP 客户端",
      "UI 混合 Element Plus + Naive UI + Reka UI + UnoCSS + GSAP",
    ],
    videoSrc: `${BASE}/videos/pump.mp4`,
    thumbnailSrc: `${BASE}/images/pump.png`,
    tags: ["DAPP", "WEB3", "LAUNCHPAD", "BASE", "VIEM", "TRADINGVIEW", "FARCASTER"],
    year: 2026,
  },
  {
    id: "3",
    slug: "extension-purse",
    title: "浏览器插件(社交推文 AI 标注)",
    description:
      "面向 AI 训练数据生产的浏览器扩展，把推文标注、XP 积分激励、Web3 钱包奖励串成「标注→积分→链上奖励」众包闭环。",
    highlights: [
      "content 端向 X / Twitter 推文注入标注面板：情感 / 主题 / NER 三类打标",
      "XP 分级激励：basic 5 / standard 10 / expert 50，单推文 +10、上限 +500",
      "mark.js + GSAP 完成文本高亮与动效，TaskList / XpLevel 实时进度条",
      "popup 端集成 2FA 安全登录、钱包连接与提现记录视图",
      "pnpm + Turbo monorepo，三端 (content / background / popup) 共享抽象",
    ],
    videoSrc: `${BASE}/videos/extension-purse.mov`,
    videoMp4Src: `${BASE}/videos/extension-purse.mp4`,
    thumbnailSrc: `${BASE}/images/extension-purse.png`,
    tags: ["EXTENSION", "CHROME MV3", "AI", "TWITTER", "MARK.JS", "GSAP", "TURBO"],
    year: 2024,
  },
  {
    id: "4",
    slug: "baabaabet",
    title: "社交预测平台",
    description:
      "覆盖赛事大厅、盘口下单、链上交易、CreateEvent、Membership NFT 的 Web3 链上预测 DApp，多链并行 + 多钱包接入。",
    highlights: [
      "Vite (主链) + Vue CLI 5 (子链) 共用 common workspace 多链并行架构",
      "自研 abi-types-generator 一键生成多份合约 TS 类型客户端",
      "ethers v5 + WalletConnect v1 + MetaMask 多钱包统一接入",
      "PIXI.js v7 老虎机 / GSAP Business + Lottie 动效 / ECharts + Highcharts",
    ],
    videoSrc: `${BASE}/videos/baabaabet.mov`,
    videoMp4Src: `${BASE}/videos/baabaabet.mp4`,
    thumbnailSrc: `${BASE}/images/baabaabet.png`,
    tags: ["DAPP", "WEB3", "PREDICTION", "VITE", "PIXI.JS", "GRAPHQL", "ETHERS"],
    year: 2023,
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getAllWorkSlugs(): string[] {
  return works.map((work) => work.slug);
}