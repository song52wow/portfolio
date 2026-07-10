export function PreloaderScreen({
  progress,
  fading,
}: {
  progress: number;
  fading: boolean;
}) {
  return (
    <div
      aria-hidden={fading}
      className={
        "fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0a0814] transition-opacity duration-500 ease-out " +
        (fading ? "opacity-0" : "opacity-100")
      }
    >
      <div className="flex flex-col items-center gap-6">
        <span className="catalog-num text-[11px] uppercase tracking-[0.34em] text-[var(--mute-on-night)]">
          Exhibition Works
        </span>

        <div className="relative h-px w-[min(58vw,340px)] overflow-hidden bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--ember)] transition-[width] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 14px rgba(241,90,74,0.55)",
            }}
          />
        </div>

        <div className="flex items-baseline gap-2.5">
          <span
            className="catalog-num text-[13px] tabular-nums text-[var(--paper-on-night)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {String(progress).padStart(3, "0")}%
          </span>
          <span className="catalog-num text-[10px] uppercase tracking-[0.22em] text-[var(--mute-on-night)]">
            Loading films
          </span>
        </div>
      </div>
    </div>
  );
}
