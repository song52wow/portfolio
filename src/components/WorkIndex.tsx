"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { works, type Work } from "@/data/works";
import { useI18n } from "@/lib/I18nContext";
import { getWorkTranslation, localeBasePath } from "@/lib/i18n";

const AUTOPLAY_MS = 8000;
const CROSSFADE_MS = 600;

/* Same basePath rationale as src/data/works.ts — see the comment there
 * and next.config.ts → `env.NEXT_PUBLIC_BASE_PATH`. Used for the
 * cinematic-hero background image hardcoded below. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Toggle the right-side thumbnail stack on/off. Set to true to bring it
 * back. Currently hidden per request. */
const SHOW_THUMBNAILS = false;

/* Compute the base path for the current locale. Used to prefix
 * carousel focus URLs (?w=<slug>) and any other in-app links, so a
 * focus jump on /en/ stays on /en/ rather than dropping the user
 * back to the default-locale home. The helper lives in
 * `@/lib/i18n` so both this file and the server pages can share it. */

/* ----------------------------------------------------------------
 * HeroBackdrop — full-viewport background for the ACTIVE work.
 * By default it shows the work's STATIC image (cinematic, darkened so
 * the centerpiece text stays legible). When the user hits play, the
 * work's VIDEO takes over the whole background and plays. Toggling
 * back to the static image pauses the video.
 * ---------------------------------------------------------------- */
function HeroBackdrop({
  work,
  isPlaying,
  objectUrls,
  backdropAria,
}: {
  work: Work;
  isPlaying: boolean;
  objectUrls?: Record<string, string>;
  backdropAria: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play / pause the background video in sync with isPlaying.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
    }
  }, [isPlaying, work.slug]);

  return (
    <div className="landscape-svg" aria-hidden>
      {/* Static image — current project's poster, full viewport */}
      <Image
        src={work.thumbnailSrc}
        alt=""
        fill
        priority
        loading="eager"
        sizes="100vw"
        unoptimized
        className="object-cover"
        style={{
          objectPosition: "center",
          filter: "blur(2px) saturate(1.05) brightness(0.6) contrast(1.02)",
          transform: "scale(1.06)",
          opacity: isPlaying ? 0 : 1,
          transition: `opacity ${CROSSFADE_MS}ms ease`,
        }}
      />

      {/* Video — plays full-screen when isPlaying, covers the image.
          key={work.slug} forces React to remount the element whenever
          the active work changes; without it the <source> children are
          swapped in-place and the browser keeps the OLD video loaded
          (since <source> attribute changes do NOT trigger a reload),
          so v.play() ends up playing the previous project's video. */}
      <video
        key={work.slug}
        ref={videoRef}
        poster={work.thumbnailSrc}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: "center",
          filter: "saturate(1.05) brightness(0.62) contrast(1.02)",
          transform: "scale(1.04)",
          opacity: isPlaying ? 1 : 0,
          transition: `opacity ${CROSSFADE_MS}ms ease`,
        }}
        aria-label={backdropAria}
      >
        {buildVideoSources(work, objectUrls).map((s) => (
          <source key={s.type} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Scrim — keeps the centerpiece text readable over either layer */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,20,0.42) 0%, rgba(10,8,20,0.12) 38%, rgba(10,8,20,0.42) 100%)",
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------
 * Cinematic Dark Carousel
 * - 100dvh single-screen experience
 * - The currently-focused work's VIDEO plays as the cinematic backdrop
 * - The currently-focused work's title occupies the centerpiece
 * - The other works sit on the right as a vertical thumbnail stack
 * - A vertical timeline on the left mirrors the carousel index
 * - The pager at the bottom supports manual and keyboard navigation
 * ---------------------------------------------------------------- */
export function WorkIndex({
  videoObjectUrls,
}: {
  videoObjectUrls?: Record<string, string>;
}) {
  const { locale, dict } = useI18n();
  const basePath = localeBasePath(locale);
  const router = useRouter();

  /* `useSearchParams()` from next/navigation forces a Suspense
   * bailout during static export prerender (the hook has no request
   * context to read at build time). To keep the carousel fully
   * server-rendered, we read `?w=<slug>` via `useSyncExternalStore`
   * subscribed to the window's popstate / history events.
   *
   * - SSR snapshot returns "" (no query), so the server renders the
   *   first work — same as if the URL had no `?w=` parameter.
   * - On the client the snapshot reads `window.location.search`,
   *   triggering a re-render that jumps to the URL-specified work.
   * - subscribe() wires popstate + a custom history event so client
   *   navigations within the SPA update the carousel index without
   *   needing router events.
   *
   * This keeps the SSR/CSR boundary clean (no setState-in-effect
   * lint warning, no hydration mismatch) while still honoring deep
   * links to specific works. */
  const searchString = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerSearchSnapshot,
  );
  const initialIndex = useMemo(() => {
    const slug = new URLSearchParams(searchString).get("w");
    if (!slug) return 0;
    const idx = works.findIndex((w) => w.slug === slug);
    return idx >= 0 ? idx : 0;
  }, [searchString]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoOverlayOpen, setVideoOverlayOpen] = useState(false);

  const isMobile = useIsMobile();

  /* Keep route param in sync with active carousel index. After
   * router.push updates window.location, dispatch a custom event so
   * the location store (used to read ?w= via useSyncExternalStore)
   * re-reads the URL. router.push returns void (the URL change is
   * synchronous in the App Router), so we defer the dispatch one
   * microtask to ensure window.location reflects the new URL. */
  const dispatchLocationChange = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("exhibition:location-change"));
    }
  }, []);

  const pushFocus = useCallback(
    (idx: number) => {
      const work = works[idx];
      if (!work) return;
      const url =
        idx === 0 ? `${basePath}/` : `${basePath}/?w=${work.slug}`;
      router.push(url, { scroll: false });
      queueMicrotask(dispatchLocationChange);
    },
    [router, basePath, dispatchLocationChange],
  );

  const clearFocus = useCallback(() => {
    router.push(`${basePath}/`, { scroll: false });
    queueMicrotask(dispatchLocationChange);
  }, [router, basePath, dispatchLocationChange]);

  const goTo = useCallback(
    (idx: number) => {
      const n = works.length;
      if (n === 0) return;
      const next = ((idx % n) + n) % n;
      if (next === activeIndex) return;
      setActiveIndex(next);
      /* Switching works always returns the backdrop to the static image.
         Set directly here (in the user-action handler) rather than via a
         reactive effect, which would be a cascading-render anti-pattern. */
      setIsPlaying(false);
    },
    [activeIndex],
  );

  /* Sync URL whenever activeIndex changes (after initial mount). */
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    pushFocus(activeIndex);
  }, [activeIndex, pushFocus]);

  /* Autoplay — pauses on hover / focus / interaction, and also while
   * the background video is actively playing (otherwise the 8s timer
   * would yank the user to the next project mid-playback). */
  useEffect(() => {
    if (isPaused || isPlaying || videoOverlayOpen) return;
    if (works.length < 2) return;
    const id = setInterval(() => {
      setActiveIndex((cur) => (cur + 1) % works.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, isPlaying, videoOverlayOpen]);

  /* Lock body scroll — single-screen carousel experience. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Keyboard navigation. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
      else if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      else if (e.key === "Escape" && activeIndex !== 0) clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, goTo, clearFocus]);

  /* Scroll to discover — wheel & touch gestures advance the carousel,
     so "Scroll to discover" literally scrolls to the next work (matching
     the reference's intent). One gesture = one navigation (throttled). */
  const wheelLock = useRef(false);
  useEffect(() => {
    if (videoOverlayOpen) return;
    const navigate = (dir: 1 | -1) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      goTo(activeIndex + dir);
      window.setTimeout(() => {
        wheelLock.current = false;
      }, 850);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - (e.touches[0]?.clientY ?? 0);
      if (Math.abs(dy) < 40) return;
      navigate(dy > 0 ? 1 : -1);
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [goTo, activeIndex, videoOverlayOpen]);

  if (works.length === 0) {
    return (
      <main className="grid min-h-dvh place-items-center px-8 text-center">
        <p className="catalog-num text-[12px] text-[var(--mute-on-night)]">
          {dict.carousel.noWorks}
        </p>
      </main>
    );
  }

  const current = works[activeIndex];
  const total = works.length;
  /* Localized text for the active work — looked up via slug against the
   * dictionary so the carousel stays in sync with whatever the server
   * page resolved for the current locale. Falls back to the (single-
   * language) data title so a missing translation never blanks the UI. */
  const currentI18n = getWorkTranslation(dict, current.slug);
  const currentTitle = currentI18n?.title ?? current.title;
  const currentDescription =
    currentI18n?.description ?? current.description;
  const currentHighlights =
    currentI18n?.highlights ?? current.highlights ?? [];

  return (
    <main
      className="cinematic cinematic-bg relative h-dvh w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hero backdrop — current work's static image, or its video
          when playing. */}
      <HeroBackdrop
        work={current}
        isPlaying={isPlaying}
        objectUrls={videoObjectUrls}
        backdropAria={dict.carousel.backdropFor.replace("{title}", currentTitle)}
      />

      {/* Play / pause the background video */}
      <PlayControl
        isMobile={isMobile}
        isPlaying={isPlaying}
        onToggleBackground={() => setIsPlaying((p) => !p)}
        onOpenOverlay={() => setVideoOverlayOpen(true)}
        playLabel={dict.carousel.playBg}
        pauseLabel={dict.carousel.pauseBg}
        openLabel={dict.carousel.openOverlay}
      />

      <VerticalTimeline
        activeIndex={activeIndex}
        onSelect={(i) => {
          setIsPaused(true);
          goTo(i);
        }}
        works={works}
        timelineLabel={dict.carousel.timeline}
        jumpToTemplate={(title) =>
          dict.carousel.jumpTo.replace("{title}", title)
        }
      />

      {/* Scroll to discover — paired with the left timeline navigation */}
      <ScrollHint
        onNext={() => {
          setIsPaused(true);
          goTo(activeIndex + 1);
        }}
        label={dict.carousel.scrollHint}
      />

      <Centerpiece
        work={current}
        title={currentTitle}
        description={currentDescription}
        highlights={currentHighlights}
        index={activeIndex}
        total={total}
        onOpen={() => router.push(`${basePath}/?w=${current.slug}`, { scroll: false })}
        carouselDict={dict.carousel}
      />

      {SHOW_THUMBNAILS && (
        <ThumbnailStack
          works={works}
          activeSlug={current.slug}
          onJump={(w) => {
            setIsPaused(true);
            const i = works.findIndex((x) => x.slug === w.slug);
            if (i >= 0) goTo(i);
          }}
          stackLabel={dict.carousel.thumbStack}
          switchToTemplate={(title) =>
            dict.carousel.switchTo.replace("{title}", title)
          }
          getTitle={(slug) => getWorkTranslation(dict, slug)?.title ?? slug}
        />
      )}

      {/* Mobile-only full-screen video player. */}
      {videoOverlayOpen && (
        <VideoOverlay
          work={current}
          title={currentTitle}
          onClose={() => setVideoOverlayOpen(false)}
          objectUrls={videoObjectUrls}
          closeLabel={dict.carousel.closeVideo}
          unsupportedHTML={dict.carousel.unsupportedVideo}
          overlayTitleTemplate={(title) =>
            dict.carousel.overlayTitle.replace("{title}", title)
          }
        />
      )}
    </main>
  );
}

/* Detect mobile viewport (Tailwind `sm` breakpoint = 640px). Routes the
 * play button to an overlay player on small screens instead of the
 * in-place cinematic background video. Starts false on the server and
 * after the first effect tick on the client to avoid hydration
 * mismatches — the first paint always shows desktop-mode controls,
 * then the hook flips if the actual viewport is < sm. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/* ----------------------------------------------------------------
 * External store: window.location.search, subscribed via
 * useSyncExternalStore. Lets the carousel track ?w=<slug> without
 * triggering a Suspense bailout (which useSearchParams would).
 *
 *   - SSR snapshot: returns "" — matches the no-?w URL the build
 *     produces for `/` and `/en/`.
 *   - CSR snapshot: returns window.location.search.
 *   - subscribe: fires on popstate AND after next.js soft navigations
 *     (we dispatch a custom event from pushFocus to keep the store
 *     in sync after router.push). next/link's prefetched
 *     navigations update window.location before popstate fires, but
 *     a microtask-deferred read covers any ordering edge case.
 * ---------------------------------------------------------------- */
function getServerSearchSnapshot(): string {
  return "";
}

function getLocationSearch(): string {
  return window.location.search;
}

function subscribeToLocation(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener("popstate", handler);
  window.addEventListener("exhibition:location-change", handler);
  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener("exhibition:location-change", handler);
  };
}

/* Build the <source> list for a work. The H.264 MP4 is preferred (plays
 * on iOS / Android / desktop Chrome); the original .mov is kept as a
 * Safari/legacy fallback. Order matters — browsers pick the first they
 * can play. */
function buildVideoSources(
  work: Work,
  objectUrls?: Record<string, string>,
): { src: string; type: string }[] {
  // Prefer the in-memory copy produced by the preloader so we never
  // download a video twice.
  const preloaded = objectUrls?.[work.slug];
  if (preloaded) {
    const isMp4 = (work.videoMp4Src ?? work.videoSrc).endsWith(".mp4");
    return [{ src: preloaded, type: isMp4 ? "video/mp4" : "video/quicktime" }];
  }
  const list: { src: string; type: string }[] = [];
  if (work.videoMp4Src) list.push({ src: work.videoMp4Src, type: "video/mp4" });
  list.push({ src: work.videoSrc, type: "video/quicktime" });
  return list;
}

/* ---------------------------------------------------------------- */

function VerticalTimeline({
  activeIndex,
  onSelect,
  works,
  timelineLabel,
  jumpToTemplate,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
  works: Work[];
  timelineLabel: string;
  jumpToTemplate: (title: string) => string;
}) {
  // Node centers are placed at (i + 0.5) / N of the container height so that
  // connector lines (positioned at the same fraction + dot radius) line up
  // exactly with each dot. Both elements reference the SAME container, so
  // the line height math (100/N%) stays consistent at every viewport size.
  const { dict } = useI18n();
  const n = works.length;
  return (
    <aside
      aria-label={timelineLabel}
      className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-[58px] items-center justify-center"
    >
      <div className="relative h-[68%] w-full">
        {/* Connector lines between nodes */}
        {works.slice(0, -1).map((_, i) => {
          const reached = i < activeIndex;
          return (
            <span
              key={`line-${i}`}
              aria-hidden
              className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
              style={{
                top: `calc(${(i + 0.5) * (100 / n)}% + 7px)`,
                height: `calc(${100 / n}% - 14px)`,
                background: reached
                  ? "var(--ember)"
                  : "rgba(244,236,217,0.12)",
              }}
            />
          );
        })}
        {/* Nodes — absolutely positioned so their CENTERS land on the same
            (i + 0.5) / N fractions the connector lines assume. */}
        {works.map((w, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          const title = getWorkTranslation(dict, w.slug)?.title ?? w.title;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={jumpToTemplate(title)}
              aria-current={isActive ? "true" : undefined}
              className="focus-ring group pointer-events-auto absolute left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                top: `calc(${(i + 0.5) * (100 / n)}%)`,
              }}
            >
              <span aria-hidden className="absolute inset-0 -m-1 rounded-full" />
              <span
                aria-hidden
                className="block rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 14 : isPast ? 8 : 6,
                  height: isActive ? 14 : isPast ? 8 : 6,
                  background: isActive
                    ? "var(--ember)"
                    : isPast
                    ? "var(--ember)"
                    : "rgba(244,236,217,0.45)",
                  boxShadow: isActive
                    ? "0 0 22px rgba(241,90,74,0.55)"
                    : "none",
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 max-w-[180px] truncate text-[10px] uppercase tracking-[0.18em] text-[var(--mute-on-night)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block"
                style={{ fontFamily: "var(--font-mono)" }}
                title={title}
              >
                {title}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- */

function Centerpiece({
  work,
  title,
  description,
  highlights,
  index,
  total,
  onOpen,
  carouselDict,
}: {
  work: Work;
  title: string;
  description: string;
  highlights: string[];
  index: number;
  total: number;
  onOpen: () => void;
  carouselDict: import("@/lib/i18n").Dictionary["carousel"];
}) {
  /* Hover/click-expand the highlights panel. Two triggers so it works
   * on both pointer (hover) and touch/keyboard (click). `key={work.slug}`
   * on the wrapper below remounts the component per work, which naturally
   * resets this state. */
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const hasHighlights = highlights.length > 0;

  /* Explore CTA — render as <a target="_blank"> when the work has an
   * externalUrl (e.g. CupOracle's live site), otherwise stay as a
   * button that focuses the carousel route. The same `btn-ember` style
   * works for both, so the visual stays consistent. */
  const exploreLabel = work.externalUrl
    ? carouselDict.visitSite
    : carouselDict.explore;
  const externalAria = carouselDict.externalWork.replace("{title}", title);
  const openAria = carouselDict.viewWork.replace("{title}", title);
  const highlightsListLabel = carouselDict.highlightsRegion.replace(
    "{title}",
    title,
  );
  const ExploreCta = work.externalUrl ? (
    <a
      href={work.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={externalAria}
      className="btn-ember focus-ring"
    >
      <span>{exploreLabel}</span>
      <ExternalArrowCircle />
    </a>
  ) : (
    <button
      type="button"
      onClick={onOpen}
      aria-label={openAria}
      className="btn-ember focus-ring"
    >
      <span>{exploreLabel}</span>
      <ArrowCircle />
    </button>
  );

  return (
    <section
      aria-label={carouselDict.currentWork}
      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pb-32 pt-28 right-0 sm:pb-0 sm:pt-24 sm:right-[clamp(0px,30vw,460px)]"
    >
      <div
        className="pointer-events-auto w-full pl-[72px] pr-6 sm:pl-[120px] sm:pr-6"
        style={{ maxWidth: "min(88ch, 92vw)" }}
      >
        {/* index chip */}
        <div
          key={`${work.slug}-idx`}
          className="mb-4 flex items-center gap-3 sm:mb-5"
          style={{
            animation: `hero-rise 800ms cubic-bezier(.2,.7,.3,1) both`,
          }}
        >
          <span aria-hidden className="inline-block h-px w-10 bg-[var(--ember)]" />
          <span className="catalog-num text-[11px] text-[var(--ember)]">
            N°{String(index + 1).padStart(2, "0")} ·{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* giant title — single-line; font size auto-fits between [minSize, maxSize]
           * so long CJK titles (e.g. 「浏览器插件(社交推文 AI 标注)」) shrink instead of
           * wrapping. See AutosizeHeadline below for the measurement algorithm.
           * `key={work.slug}` re-mounts the component on work change so the entrance
           * animation re-fires and the size is re-measured for the new string. */}
        <AutosizeHeadline
          key={work.slug}
          text={title}
          minSize={36}
          maxSize={104}
          title={title}
          style={{
            textShadow:
              "0 4px 24px rgba(10,8,20,0.65), 0 16px 60px rgba(10,8,20,0.55)",
            animation: `hero-rise 800ms cubic-bezier(.2,.7,.3,1) both`,
          }}
        />

        {/* meta line */}
        <p
          key={`${work.slug}-meta`}
          className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-[var(--paper-on-night)]/85 sm:mt-6 sm:max-w-[44ch] sm:text-[16px]"
          style={{
            textShadow: "0 2px 14px rgba(10,8,20,0.7)",
            animation: `hero-rise 800ms 120ms cubic-bezier(.2,.7,.3,1) both`,
          }}
        >
          {description}
        </p>

        {/* Tech highlights — hidden by default, expands on hover/focus
            for the active work. Bounded so the carousel layout stays
            single-screen on tall portrait phones. Entrance animation
            mirrors the rest of the hero stack so the panel arrives in
            step with the title / description. */}
        {hasHighlights && (
          <div
            key={`${work.slug}-hl`}
            className="mt-4 max-w-[40ch] sm:mt-5 sm:max-w-[44ch]"
            onMouseEnter={() => setHighlightsOpen(true)}
            onMouseLeave={() => setHighlightsOpen(false)}
            style={{
              animation: `hero-rise 800ms 180ms cubic-bezier(.2,.7,.3,1) both`,
            }}
          >
            <button
              type="button"
              onClick={() => setHighlightsOpen((s) => !s)}
              aria-expanded={highlightsOpen}
              aria-controls={`${work.slug}-hl-list`}
              className="focus-ring inline-flex items-center gap-2 rounded-sm text-[10px] uppercase tracking-[0.18em] text-[var(--paper-on-night)]/55 transition-colors duration-200 hover:text-[var(--paper-on-night)]/90"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                aria-hidden
                className="inline-block transition-transform duration-200"
                style={{ transform: highlightsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                ▸
              </span>
              <span>{carouselDict.techHighlights}</span>
              <span aria-hidden className="opacity-60">
                ({highlights.length})
              </span>
            </button>

            <div
              id={`${work.slug}-hl-list`}
              role="region"
              aria-label={highlightsListLabel}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{
                gridTemplateRows: highlightsOpen ? "1fr" : "0fr",
              }}
            >
              <ul className="min-h-0 overflow-hidden">
                <ul className="mt-2.5 space-y-1.5 pb-1 text-[12.5px] leading-snug text-[var(--paper-on-night)]/75 sm:text-[13px]">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--ember)]/80" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </ul>
            </div>
          </div>
        )}

        {/* footer: CTA + tags. Layout is stacked vertically — CTA on its
            own row, tags as chips on the row below — so the relationship
            reads cleanly across all four projects regardless of how
            many tags each carries. */}
        <div
          key={`${work.slug}-cta`}
          className="mt-7 sm:mt-9"
          style={{
            animation: `hero-rise 800ms 260ms cubic-bezier(.2,.7,.3,1) both`,
          }}
        >
          {ExploreCta}

          <div
            className="mt-3.5 flex flex-wrap gap-2"
            aria-label={carouselDict.techTags}
          >
            {work.tags?.slice(0, 3).map((t) => (
              <span
                key={t}
                className="catalog-num inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--paper-on-night)]/75"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </span>
            ))}
            {work.tags && work.tags.length > 3 && (
              <span
                className="catalog-num inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--paper-on-night)]/55"
                style={{ fontFamily: "var(--font-mono)" }}
                title={work.tags.slice(3).join(" · ")}
              >
                +{work.tags.length - 3}
              </span>
            )}
            {work.year !== undefined && (
              <span
                className="catalog-num inline-flex items-center rounded-full border border-[var(--ember)]/35 bg-[var(--ember)]/10 px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--ember)]/90"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {work.year}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
 * AutosizeHeadline — auto-shrink a single-line heading to fit its
 * container width. Algorithm:
 *   1. Try maxSize. If scrollWidth <= clientWidth → done.
 *   2. Otherwise scale down linearly as a first estimate, then binary
 *      search within [minSize, estimate] to land on the largest size
 *      that still fits (font widths aren't strictly linear under the
 *      webfont hinting, so the linear guess is just a starting point).
 *   3. Floor at minSize — if the string still overflows at minSize,
 *      we keep minSize and let the layout absorb the overflow rather
 *      than truncate or wrap (the parent uses pointer-events: none
 *      over the right gutter so visual spillover is harmless).
 * Re-fires on container resize (ResizeObserver) and on text change.
 * Font readiness is awaited once so the measurement is post-hinting.
 * ---------------------------------------------------------------- */
function AutosizeHeadline({
  text,
  minSize,
  maxSize,
  title,
  className,
  style,
}: {
  text: string;
  minSize: number;
  maxSize: number;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState<number>(maxSize);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;

        // Reset to max and read natural single-line width.
        el.style.fontSize = `${maxSize}px`;
        if (el.scrollWidth <= el.clientWidth + 1) {
          setSize(maxSize);
          return;
        }

        // Linear estimate: target = maxSize * (client / natural).
        const ratio = el.clientWidth / el.scrollWidth;
        const estimate = Math.max(minSize, maxSize * ratio);
        el.style.fontSize = `${estimate}px`;

        // Refine via binary search — CJK fallback font widths can
        // drift from linear, so the estimate may still overflow.
        if (el.scrollWidth > el.clientWidth + 1) {
          let lo = minSize;
          let hi = estimate;
          let best = minSize;
          for (let i = 0; i < 14; i++) {
            const mid = (lo + hi) / 2;
            el.style.fontSize = `${mid}px`;
            if (el.scrollWidth <= el.clientWidth + 1) {
              best = mid;
              lo = mid;
            } else {
              hi = mid;
            }
            if (hi - lo < 0.5) break;
          }
          el.style.fontSize = `${best}px`;
          setSize(best);
        } else {
          setSize(estimate);
        }
      });
    };

    fit();

    // Re-measure once webfonts settle — CJK falls back to a system font
    // whose metrics may differ from the latin Bricolage measurement.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => {});
    }

    const ro = new ResizeObserver(fit);
    ro.observe(node);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, minSize, maxSize]);

  return (
    <h1
      ref={ref}
      className={className ?? "display-headline text-[var(--paper-on-night)]"}
      title={title}
      style={{
        whiteSpace: "nowrap",
        fontSize: `${size}px`,
        ...style,
      }}
    >
      {text}
    </h1>
  );
}

function ArrowCircle() {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--paper-on-night)] text-[var(--ember)]"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

/* Diagonal arrow — signals an off-site jump for the external-link
 * variant of the Explore CTA (CupOracle → cuporacle.xyz). */
function ExternalArrowCircle() {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--paper-on-night)] text-[var(--ember)]"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- */

function ThumbnailStack({
  works,
  activeSlug,
  onJump,
  stackLabel,
  switchToTemplate,
  getTitle,
}: {
  works: Work[];
  activeSlug: string;
  onJump: (work: Work) => void;
  stackLabel: string;
  switchToTemplate: (title: string) => string;
  getTitle: (slug: string) => string;
}) {
  // Show ALL works (including active) — matches the reference which
  // shows 3 destination tiles regardless of which is in focus. The
  // active one is visually marked with an ember border.
  const visible = works.slice(0, 3);
  return (
    <aside
      aria-label={stackLabel}
      className="absolute right-0 top-0 z-10 hidden h-dvh w-[300px] flex-col justify-center gap-4 px-6 py-12 xl:flex 2xl:w-[340px]"
    >
      <div className="flex flex-col gap-4">
        {visible.map((w, i) => (
          <ThumbCard
            key={w.id}
            work={w}
            title={getTitle(w.slug)}
            onJump={() => onJump(w)}
            showArrow={i === 0}
            isActive={w.slug === activeSlug}
            cardIndex={i}
            switchAria={switchToTemplate(getTitle(w.slug))}
          />
        ))}
      </div>
    </aside>
  );
}

function ThumbCard({
  work,
  title,
  onJump,
  showArrow,
  isActive,
  cardIndex,
  switchAria,
}: {
  work: Work;
  title: string;
  onJump: () => void;
  showArrow: boolean;
  isActive: boolean;
  cardIndex: number;
  switchAria: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-3px)`;
  }, []);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }, []);

  // Each card uses the same cinematic-hero image but framed on a
  // different CLEAN region (avoiding the reference image's embedded
  // UI bands) so each card reads as a distinct destination tile.
  // Source image is 1730x1114. Crop coordinates target landscape-only:
  // - card 0: Mt Fuji + sakura on the left
  // - card 1: Sky + Fuji with sunset glow (mid)
  // - card 2: Sakura + pagoda (right-bottom)
  const cropPosition =
    cardIndex === 0 ? "28% 70%" :
    cardIndex === 1 ? "55% 60%" :
    cardIndex === 2 ? "82% 75%" : "50% 60%";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onJump}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label={switchAria}
      aria-current={isActive ? "true" : undefined}
      className="focus-ring card-3d group relative block w-full overflow-hidden rounded-2xl border text-left"
      style={{
        aspectRatio: "3 / 4",
        borderColor: isActive ? "rgba(241,90,74,0.6)" : "rgba(255,255,255,0.10)",
        boxShadow: isActive
          ? "0 0 0 1px rgba(241,90,74,0.4), 0 12px 40px -8px rgba(241,90,74,0.35)"
          : "none",
      }}
    >
      <Image
        src={`${BASE}/images/cinematic-hero.jpg`}
        alt=""
        fill
        priority
        loading="eager"
        sizes="(max-width: 1280px) 240px, 300px"
        unoptimized
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        style={{
          objectPosition: cropPosition,
          filter:
            isActive
              ? "blur(6px) saturate(1.05) brightness(0.85)"
              : "blur(6px) saturate(0.9) brightness(0.5)",
        }}
      />
      {/* Bottom-darkening overlay only — keeps text readable without
          flattening the photographic content above. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,20,0.0) 0%, rgba(10,8,20,0.10) 35%, rgba(10,8,20,0.55) 75%, rgba(10,8,20,0.85) 100%)",
        }}
      />
      {/* Top-darkening scrim — keeps the location-pin + title readable */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,20,0.55) 0%, rgba(10,8,20,0.0) 100%)",
        }}
      />
      {/* Header — location-pin chip + name + tagline (reference layout) */}
      <div className="absolute inset-x-0 top-0 flex items-start gap-2.5 p-3.5">
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--ember)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--paper-on-night)" }}
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[var(--paper-on-night)]"
            style={{ fontFamily: "var(--font-display)" }}
            title={title}
          >
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] leading-snug text-[var(--paper-on-night)]/80">
            {taglineFor(work)}
          </p>
        </div>
      </div>

      {/* Bottom-center round arrow — only on the first (lead) card, like the reference */}
      {showArrow && (
        <span
          aria-hidden
          className="absolute bottom-4 left-1/2 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white/20 text-[var(--paper-on-night)] backdrop-blur-md transition-colors group-hover:bg-[var(--ember)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* Derive a short tagline from the work's first description clause,
 * or its first tag, when the description is too long for the card. */
function taglineFor(work: Work): string {
  const desc = work.description?.trim() ?? "";
  if (!desc) return work.tags?.[0] ?? "";
  // Try the first clause up to a comma / period
  const first = desc.split(/[，。,.；;]/)[0].trim();
  return first.length > 36 ? first.slice(0, 34) + "…" : first;
}

/* ----------------------------------------------------------------
 * PlayControl — large circular button that toggles the background
 * video on/off. When idle it shows a play glyph over the static
 * image; once playing it becomes a pause control.
 * ---------------------------------------------------------------- */
function PlayControl({
  isMobile,
  isPlaying,
  onToggleBackground,
  onOpenOverlay,
  playLabel,
  pauseLabel,
  openLabel,
}: {
  isMobile: boolean;
  isPlaying: boolean;
  onToggleBackground: () => void;
  onOpenOverlay: () => void;
  playLabel: string;
  pauseLabel: string;
  openLabel: string;
}) {
  // On mobile the button opens a full-screen overlay player (the .mov
  // sources don't play inline on small screens / Android, and an inline
  // background video fights the carousel's swipe gestures). On desktop it
  // toggles the cinematic background video as before.
  const overlayMode = isMobile;
  const active = overlayMode ? false : isPlaying;

  return (
    <button
      type="button"
      onClick={overlayMode ? onOpenOverlay : onToggleBackground}
      aria-label={
        active
          ? pauseLabel
          : overlayMode
            ? openLabel
            : playLabel
      }
      aria-pressed={active}
      className="focus-ring group absolute right-4 bottom-6 z-20 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-white/20 bg-white/[0.07] text-[var(--paper-on-night)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/[0.14] sm:right-5 sm:bottom-auto sm:top-1/2 sm:h-[84px] sm:w-[84px] sm:-translate-y-1/2"
    >
      {/* subtle inner ring */}
      <span
        aria-hidden
        className="absolute inset-1 rounded-full ring-1 ring-white/10 transition-all duration-300 group-hover:ring-white/25"
      />
      {active ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="ml-1 transition-transform duration-300 group-hover:scale-110"
    >
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="transition-transform duration-300 group-hover:scale-110"
    >
      <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" />
    </svg>
  );
}

/* ----------------------------------------------------------------
 * VideoOverlay — mobile-only full-screen player. Tapping play on a phone
 * opens this modal instead of swapping in an inline background video.
 * Unsupported formats (.mov on Android) fall back to a friendly message
 * instead of a broken black frame, and the carousel gestures/autoplay are
 * paused while it's open (see WorkIndex guards).
 * ---------------------------------------------------------------- */
function VideoOverlay({
  work,
  title,
  onClose,
  objectUrls,
  closeLabel,
  unsupportedHTML,
  overlayTitleTemplate,
}: {
  work: Work;
  title: string;
  onClose: () => void;
  objectUrls?: Record<string, string>;
  closeLabel: string;
  unsupportedHTML: string;
  overlayTitleTemplate: (title: string) => string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  /* `unsupported` is computed once on mount via useState's lazy initializer.
   * The parent component remounts <VideoOverlay> on each open, so this
   * probe always runs against the active work — no setState-in-effect
   * cascade needed. */
  const [unsupported] = useState(() => {
    if (typeof document === "undefined") return false;
    const probe = document.createElement("video");
    return !buildVideoSources(work).some((s) => {
      const r = probe.canPlayType(s.type);
      return r === "probably" || r === "maybe";
    });
  });

  // Esc closes the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Autoplay (muted, to satisfy the mobile autoplay policy). Skipped on
   * unsupported devices — the JSX renders a friendly fallback message
   * instead. */
  useEffect(() => {
    if (unsupported) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay blocked — native controls remain available */
      });
    }
  }, [unsupported]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={overlayTitleTemplate(title)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="focus-ring absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[var(--paper-on-night)] backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div
        className="relative w-full max-w-[1000px] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {unsupported || failed ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="relative aspect-video w-full">
              <Image
                src={work.thumbnailSrc}
                alt=""
                fill
                unoptimized
                className="object-cover"
                style={{ filter: "brightness(0.7)" }}
              />
            </div>
            <p
              className="px-5 py-4 text-center text-[14px] leading-relaxed text-[var(--paper-on-night)]/85"
              dangerouslySetInnerHTML={{ __html: unsupportedHTML }}
            />
          </div>
        ) : (
          <video
            key={work.slug}
            ref={videoRef}
            poster={work.thumbnailSrc}
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={() => setFailed(true)}
            className="mx-auto max-h-[88vh] w-full rounded-xl"
          >
            {buildVideoSources(work, objectUrls).map((s) => (
              <source key={s.type} src={s.src} type={s.type} />
            ))}
          </video>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * ScrollHint — bottom-left "Scroll to discover" control. Paired
 * with the left VerticalTimeline: both live in the left column and
 * advance to the next work (scroll / swipe / click).
 * ---------------------------------------------------------------- */
function ScrollHint({
  onNext,
  label,
}: {
  onNext: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onNext}
      aria-label={label}
      className="focus-ring group pointer-events-auto absolute bottom-6 left-6 z-20 flex cursor-pointer items-center gap-3 bg-transparent p-0 sm:bottom-7 sm:left-10"
    >
      <span className="circle-btn inline-flex transition-all duration-200 group-hover:border-white/30 group-hover:bg-white/[0.14] group-hover:text-[var(--paper-on-night)]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14" />
          <path d="m6 13 6 6 6-6" />
        </svg>
      </span>
      <span className="catalog-num hidden text-[10px] text-[var(--mute-on-night)] transition-all duration-200 group-hover:tracking-[0.22em] group-hover:text-[var(--paper-on-night)] sm:inline">
        {label}
      </span>
    </button>
  );
}