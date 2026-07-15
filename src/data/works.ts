export type Work = {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoSrc: string;
  videoMp4Src?: string;
  thumbnailSrc: string;
  tags?: string[];
  year?: number;
};

/* basePath is injected at build time via NEXT_PUBLIC_BASE_PATH (see
 * next.config.ts → `env`). Next.js's basePath only auto-prefixes
 * <Link>/router-managed URLs; raw strings used in <video>, <source>,
 * and <Image src> are NOT prefixed. Inlining the prefix here keeps the
 * data file as the single source of truth for asset paths.
 *  - In dev: ""  → /videos/foo.mp4
 *  - In prod (GitHub Pages at /portfolio): "/portfolio" → /portfolio/videos/foo.mp4 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const works: Work[] = [
  {
    id: "1",
    slug: "baabaabet",
    title: "BaaBaaBet",
    description:
      "覆盖赛事大厅、下单处理、自建事件、Membership NFT、个人中心全链路的 Web3 链上预测 DApp。",
    videoSrc: `${BASE}/videos/baabaabet.mov`,
    videoMp4Src: `${BASE}/videos/baabaabet.mp4`,
    thumbnailSrc: `${BASE}/images/baabaabet.png`,
    tags: ["DAPP", "WEB3", "PREDICTION"],
    year: 2025,
  },
  {
    id: "2",
    slug: "cuporacle",
    title: "CupOracle",
    description:
      "足球预言家：预测足球世界杯赛事结果的 AI 助手。",
    videoSrc: `${BASE}/videos/cuporacle.mov`,
    videoMp4Src: `${BASE}/videos/cuporacle.mp4`,
    thumbnailSrc: `${BASE}/images/cuporacle.png`,
    tags: ["AI", "PREDICTION"],
    year: 2026,
  },
  {
    id: "3",
    slug: "pump",
    title: "Pump",
    description:
      "基于 Base 网络的去中心化代币启动平台，专注文化币 / Meme 币 / 社区驱动型数字资产的无许可发行与交易，配套 PC + 钱包内 DApp 双端访问。",
    videoSrc: `${BASE}/videos/pump.mp4`,
    thumbnailSrc: `${BASE}/images/pump.png`,
    tags: ["DAPP", "WEB3", "LAUNCHPAD", "BASE"],
    year: 2025,
  },
  {
    id: "4",
    slug: "extension",
    title: "Extension Purse",
    description:
      "Chrome 浏览器扩展：一键将视频链接转换为嵌入代码。",
    videoSrc: `${BASE}/videos/extension-purse.mov`,
    videoMp4Src: `${BASE}/videos/extension-purse.mp4`,
    thumbnailSrc: `${BASE}/images/extension-purse.png`,
    tags: ["EXTENSION", "CHROME"],
    year: 2026,
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getAllWorkSlugs(): string[] {
  return works.map((work) => work.slug);
}