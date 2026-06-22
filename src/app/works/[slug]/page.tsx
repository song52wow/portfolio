import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImmersiveGallery } from "@/components/ImmersiveGallery";
import { getAllWorkSlugs, getWorkBySlug } from "@/data/works";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    return { title: "作品未找到" };
  }

  return {
    title: work.title,
    description: work.description,
    openGraph: {
      title: work.title,
      description: work.description,
      type: "video.other",
      images: [
        {
          url: work.thumbnailSrc,
          alt: `${work.title} 封面`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: work.description,
      images: [work.thumbnailSrc],
    },
  };
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return (
    <main className="h-dvh w-full">
      <ImmersiveGallery initialSlug={slug} />
    </main>
  );
}
