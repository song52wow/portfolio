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
    slug: "BaaBaaBet",
    title: "BaaBaaBet",
    description:
      "覆盖赛事大厅、下单处理、自建事件、Membership NFT、个人中心全链路的 Web3 链上预测 DApp",
    videoSrc: "/videos/baabaabet.mov",
    thumbnailSrc: "/images/baabaabet.png",
    tags: [],
    year: 2025,
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getAllWorkSlugs(): string[] {
  return works.map((work) => work.slug);
}
