"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { works, type Work } from "@/data/works";

type ImmersiveGalleryProps = {
  initialSlug?: string;
};

export function ImmersiveGallery({ initialSlug }: ImmersiveGalleryProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [selectedSlug, setSelectedSlug] = useState(
    () => initialSlug ?? works[0]?.slug ?? "",
  );
  const [isMuted, setIsMuted] = useState(true);
  const [isBottomHovered, setIsBottomHovered] = useState(false);

  const selectedWork =
    works.find((work) => work.slug === selectedSlug) ?? works[0];

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    const el = itemRefs.current.get(selectedSlug);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedSlug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    void video.play().catch(() => {});
  }, [selectedSlug]);

  const selectWork = useCallback(
    (work: Work) => {
      setSelectedSlug(work.slug);
      router.push(`/works/${work.slug}`, { scroll: false });
    },
    [router],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  if (!selectedWork) return null;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* 全屏背景视频 */}
      <div className="absolute inset-0 h-dvh w-full">
        <video
          ref={videoRef}
          key={selectedWork.slug}
          className="h-full w-full object-cover"
          src={selectedWork.videoSrc}
          poster={selectedWork.thumbnailSrc}
          autoPlay
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          aria-label={`${selectedWork.title} 视频`}
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-300 ${
            isBottomHovered ? "opacity-10" : "opacity-0"
          }`}
          aria-hidden
        />
      </div>

      {/* 顶部品牌与取消静音 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-6">
        <Link
          href="/"
          className="pointer-events-auto text-sm font-semibold tracking-tight text-zinc-100/90 transition-colors hover:text-white"
        >
          作品集
        </Link>
        {isMuted && (
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto rounded-full border border-zinc-600/80 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-sm transition-colors hover:border-zinc-400 hover:text-white"
          >
            点击开启声音
          </button>
        )}
      </div>

      {/* 底部悬浮区：作品列表 + 作品说明 */}
      <div
        className={`absolute inset-x-4 bottom-6 z-20 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/75 backdrop-blur-md transition-opacity duration-300 ${
          isBottomHovered ? "opacity-100" : "opacity-90"
        }`}
        role="region"
        aria-label="作品列表"
        onMouseEnter={() => setIsBottomHovered(true)}
        onMouseLeave={() => setIsBottomHovered(false)}
      >
        {/* 模块一：横向作品缩略图 */}
        <div className="overflow-x-auto overscroll-x-contain border-b border-zinc-800/50 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          <div className="flex snap-x snap-mandatory gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
            {works.map((work) => {
              const isSelected = work.slug === selectedSlug;
              return (
                <button
                  key={work.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(work.slug, el);
                    else itemRefs.current.delete(work.slug);
                  }}
                  type="button"
                  onClick={() => selectWork(work)}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`播放 ${work.title}`}
                  className={`group shrink-0 snap-center overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? "scale-105 border-zinc-100 shadow-lg shadow-black/40"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative h-[4.5rem] w-[5.5rem] bg-zinc-900 sm:h-[5rem] sm:w-[6.5rem]">
                    <Image
                      src={work.thumbnailSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="104px"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                      <span className="line-clamp-1 text-left text-[10px] font-medium text-zinc-100 sm:text-xs">
                        {work.title}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 模块二：选中作品说明 */}
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-base font-semibold text-zinc-50 sm:text-lg">
            {selectedWork.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {selectedWork.year && (
              <span className="text-sm text-zinc-400">{selectedWork.year}</span>
            )}
            {selectedWork.tags && selectedWork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedWork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {selectedWork.description}
          </p>
        </div>
      </div>
    </div>
  );
}
