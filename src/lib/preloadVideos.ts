/* Stream-download every work's video so the loading progress bar reflects
 * the REAL transfer of ALL videos, and return object URLs the player can
 * reuse — so each video is fetched exactly once.
 *
 * - `onProgress(loaded, total)` fires with cumulative bytes across all videos.
 * - Any single failure is swallowed: that video is simply skipped and the
 *   player falls back to loading from the path. The whole experience never
 *   blocks on one flaky download. */

export type PreloadSource = { slug: string; url: string };

export async function preloadVideos(
  sources: PreloadSource[],
  onProgress: (loaded: number, total: number) => void,
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const totals: Record<string, number> = {};
  const loadedMap: Record<string, number> = {};

  // Seed a baseline of 1 byte per video so progress never divides by zero
  // before content-length is known.
  let grandTotal = 0;
  for (const s of sources) {
    totals[s.slug] = 1;
    loadedMap[s.slug] = 0;
    grandTotal += 1;
  }

  const report = () => {
    // Clamp each source's contribution at its current best-known total so a
    // chunk that lands before the Content-Length header can't inflate `loaded`
    // past what we know to be its true ceiling. Combined with `grandTotal`
    // growing in lockstep as headers arrive, this keeps loaded/total
    // monotonic — the bar never spikes and falls mid-stream.
    let loaded = 0;
    for (const slug of Object.keys(loadedMap)) {
      const known = totals[slug] ?? 0;
      loaded += Math.min(loadedMap[slug], known);
    }
    onProgress(loaded, grandTotal);
  };
  report();

  await Promise.all(
    sources.map(async (s) => {
      try {
        const res = await fetch(s.url);
        if (!res.ok || !res.body) {
          loadedMap[s.slug] = totals[s.slug];
          report();
          return;
        }
        const len = Number(res.headers.get("content-length") || 0);
        if (len > 0) {
          // Replace the 1-byte baseline with the real size.
          grandTotal += len - 1;
          totals[s.slug] = len;
        }
        const reader = res.body.getReader();
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            // Copy into an ArrayBuffer-backed view so it's a valid BlobPart
            // regardless of the stream's underlying buffer type.
            const view = new Uint8Array(value.byteLength);
            view.set(value);
            chunks.push(view);
            received += value.byteLength;
            loadedMap[s.slug] = received;
            report();
          }
        }
        const isMp4 = s.url.endsWith(".mp4");
        const blob = new Blob(chunks, {
          type: isMp4 ? "video/mp4" : "video/quicktime",
        });
        urls[s.slug] = URL.createObjectURL(blob);
      } catch {
        // Network error — drop this video, don't block the rest.
        loadedMap[s.slug] = totals[s.slug];
        report();
      }
    }),
  );

  return urls;
}
