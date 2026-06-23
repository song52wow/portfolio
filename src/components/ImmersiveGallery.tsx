"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { works, type Work } from "@/data/works";

type ImmersiveGalleryProps = {
  initialSlug?: string;
};

export function ImmersiveGallery({ initialSlug }: ImmersiveGalleryProps) {
  const router = useRouter();
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [selectedSlug, setSelectedSlug] = useState(
    () => initialSlug ?? works[0]?.slug ?? "",
  );
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const [layerASlug, setLayerASlug] = useState(selectedSlug);
  const [layerBSlug, setLayerBSlug] = useState<string | null>(null);

  const selectedWork =
    works.find((work) => work.slug === selectedSlug) ?? works[0];
  const selectedIndex = works.findIndex((work) => work.slug === selectedSlug);

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
      setLayerASlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    const el = itemRefs.current.get(selectedSlug);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedSlug]);

  // 当 pendingSlug 变化时,加载 layerB
  useEffect(() => {
    if (!pendingSlug || pendingSlug === layerASlug) return;
    setLayerBSlug(pendingSlug);
    setActiveLayer("B");
    const video = videoBRef.current;
    if (!video) return;
    video.load();
    void video.play().catch(() => {});
  }, [pendingSlug, layerASlug]);

  // 当 layerB 视频 loadeddata 后,260ms 完成切换
  const handleLayerBLoaded = useCallback(() => {
    const timer = setTimeout(() => {
      setLayerASlug((_prev) => {
        const next = layerBSlug ?? _prev;
        setActiveLayer("A");
        setLayerBSlug(null);
        setPendingSlug(null);
        return next;
      });
      if (pendingSlug) {
        router.replace(`/?w=${pendingSlug}`, { scroll: false });
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [layerBSlug, pendingSlug, router]);

  const selectWork = useCallback(
    (work: Work) => {
      if (work.slug === selectedSlug) return;
      setSelectedSlug(work.slug);
      setPendingSlug(work.slug);
    },
    [selectedSlug],
  );

  const toggleMute = useCallback(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    [videoA, videoB].forEach((v) => {
      if (!v) return;
      v.muted = !v.muted;
    });
    setIsMuted((m) => !m);
  }, []);

  if (!selectedWork) return null;

  const currentWorkA = works.find((w) => w.slug === layerASlug) ?? selectedWork;
  const currentWorkB = layerBSlug
    ? works.find((w) => w.slug === layerBSlug)
    : null;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* 双视频层 */}
      <video
        ref={videoARef}
        key={`a-${currentWorkA.slug}`}
        className={`video-layer ${activeLayer === "A" && !pendingSlug ? "active" : ""}`}
        src={currentWorkA.videoSrc}
        poster={currentWorkA.thumbnailSrc}
        autoPlay
        muted={isMuted}
        playsInline
        loop
        preload="auto"
        aria-label={`${currentWorkA.title} 视频`}
      />
      {currentWorkB && (
        <video
          ref={videoBRef}
          key={`b-${currentWorkB.slug}`}
          className={`video-layer ${activeLayer === "B" ? "active" : ""}`}
          src={currentWorkB.videoSrc}
          poster={currentWorkB.thumbnailSrc}
          autoPlay
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          onLoadedData={handleLayerBLoaded}
          aria-label={`${currentWorkB.title} 视频`}
        />
      )}

      {/* 顶部:左上 REC 编号 + 右上 SOUND 按钮 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6">
        <div
          className="pointer-events-auto flex items-center gap-2 text-[var(--text-dim)]"
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "10px",
            letterSpacing: "0.35em",
          }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--rec)" }}
            aria-hidden
          />
          <span>REC // N°{String(selectedIndex + 1).padStart(2, "0")}</span>
        </div>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? "开启声音" : "关闭声音"}
          className="pointer-events-auto rounded-full border px-3 py-1.5 text-[var(--gold)] transition-colors hover:text-[var(--gold-soft)]"
          style={{
            fontFamily: "var(--font-cinzel)",
            borderColor: "var(--gold)",
            fontSize: "10px",
            letterSpacing: "0.3em",
          }}
        >
          {isMuted ? "SOUND OFF" : "SOUND ON"}
        </button>
      </div>

      {/* 底部面板 */}
      <div
        className="absolute inset-x-4 bottom-6 z-20 sm:inset-x-6"
        role="region"
        aria-label="作品信息"
      >
        {/* 顶部金线分隔 */}
        <div
          className="mb-4 h-px w-full"
          style={{ background: "var(--gold-pale)" }}
          aria-hidden
        />

        {/* 标题与元数据 */}
        <div className="px-2 pb-4 sm:px-4">
          <h1
            className="text-[var(--text)]"
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: "clamp(24px, 4vw, 36px)",
              letterSpacing: "0.2em",
              lineHeight: 1.1,
            }}
          >
            {selectedWork.title.toUpperCase()}
          </h1>
          {/* 标题下方短金线 */}
          <div
            className="mt-3 h-[2px] w-10"
            style={{ background: "var(--gold)" }}
            aria-hidden
          />
          <div
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--text-dim)]"
            style={{ fontSize: "11px", letterSpacing: "0.3em" }}
          >
            {selectedWork.year && <span>{selectedWork.year}</span>}
            {selectedWork.tags && selectedWork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedWork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border px-2 py-0.5 text-[var(--gold-soft)]"
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      borderColor: "var(--gold)",
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p
            className="mt-3 text-[var(--text-dim)]"
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "14px",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            {selectedWork.description}
          </p>
        </div>

        {/* 缩略图带 */}
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          <div className="flex snap-x snap-mandatory gap-3 px-2 pb-2 sm:gap-4 sm:px-4">
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
                  className="group shrink-0 snap-center overflow-hidden rounded-md transition-colors"
                  style={{
                    border: `1px solid ${isSelected ? "var(--gold)" : "var(--gold-pale)"}`,
                    boxShadow: isSelected
                      ? "0 0 0 1px var(--gold-soft), 0 0 12px rgba(184, 134, 11, 0.25)"
                      : "none",
                  }}
                >
                  <div className="relative h-[4.5rem] w-[5.5rem] bg-[var(--surface)] sm:h-[5rem] sm:w-[6.5rem]">
                    <Image
                      src={work.thumbnailSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="104px"
                      aria-hidden
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-4"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10, 8, 6, 0.85), transparent)",
                      }}
                    >
                      <span
                        className="line-clamp-1 block text-left text-[var(--text)]"
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {work.title.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}