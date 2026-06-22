import type { Metadata } from "next";
import { ImmersiveGallery } from "@/components/ImmersiveGallery";

export const metadata: Metadata = {
  title: "全部作品",
  description: "浏览影像作品集，包含短片、实验影像与视觉创作。",
  openGraph: {
    title: "全部作品",
    description: "浏览影像作品集，包含短片、实验影像与视觉创作。",
  },
};

export default function HomePage() {
  return (
    <main className="h-dvh w-full">
      <ImmersiveGallery />
    </main>
  );
}
