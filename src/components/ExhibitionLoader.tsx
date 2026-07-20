"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { WorkIndex } from "./WorkIndex";
import { PreloaderScreen } from "./PreloaderScreen";
import { preloadVideos } from "@/lib/preloadVideos";
import { works } from "@/data/works";
import { useI18n } from "@/lib/I18nContext";

type Phase = "loading" | "revealing" | "done";

/* Hard ceiling so a slow / flaky network can never trap the visitor on the
 * preloader forever. When it trips, the player simply loads from the path. */
const SAFETY_TIMEOUT_MS = 45_000;

export function ExhibitionLoader() {
  const { dict } = useI18n();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [urls, setUrls] = useState<Record<string, string>>({});

  const startReveal = useCallback(() => {
    setPhase((p) => (p === "loading" ? "revealing" : p));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sources = works.map((w) => ({
      slug: w.slug,
      url: w.videoMp4Src ?? w.videoSrc,
    }));

    preloadVideos(sources, (loaded, total) => {
      if (cancelled) return;
      const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
      // Defense-in-depth: belt-and-suspenders monotonic clamp. Even if a
      // future change to preloadVideos introduces another racy report, the
      // displayed percentage must never go backwards.
      setProgress((prev) => Math.max(prev, pct));
    })
      .then((map) => {
        if (cancelled) return;
        setUrls(map);
        startReveal();
      })
      .catch(() => {
        if (cancelled) return;
        setUrls({});
        startReveal();
      });

    const safety = window.setTimeout(() => {
      if (cancelled) return;
      startReveal();
    }, SAFETY_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, [startReveal]);

  // Crossfade from the preloader to the carousel once reveal starts.
  useEffect(() => {
    if (phase !== "revealing") return;
    const t = window.setTimeout(() => setPhase("done"), 600);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <>
      {(phase === "loading" || phase === "revealing") && (
        <PreloaderScreen
          progress={progress}
          fading={phase === "revealing"}
          brand={dict.preloader.brand}
          loadingFilms={dict.preloader.loadingFilms}
        />
      )}
      <div
        className={phase === "loading" ? "opacity-0" : "opacity-100"}
        style={{ transition: "opacity 600ms ease" }}
      >
        {/* WorkIndex calls useSearchParams() to read ?w=<slug>; static
         * export prerender requires a Suspense boundary at this level
         * so the carousel can hydrate on the client. The fallback is
         * null because the PreloaderScreen above already covers the
         * viewport during loading — there's nothing visible for the
         * fallback to show. */}
        <Suspense fallback={null}>
          <WorkIndex videoObjectUrls={urls} />
        </Suspense>
      </div>
    </>
  );
}