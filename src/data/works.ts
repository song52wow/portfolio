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
  {
    id: "2",
    slug: "cuporacle",
    title: "CupOracle",
    description:
      "足球预言家：预测足球世界杯赛事结果的 AI 助手。",
    videoSrc: "/videos/cuporacle.mov",
    thumbnailSrc: "/images/cuporacle.png",
    tags: ["AI", "PREDICTION"],
    year: 2026,
  },
  {
    id: "3",
    slug: "extension",
    title: "Extension Purse",
    description:
      "Chrome 浏览器扩展：一键将视频链接转换为嵌入代码。",
    videoSrc: "/videos/extension-purse.mov",
    thumbnailSrc: "/images/extension-purse.png",
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