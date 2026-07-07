import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { works } from "@/data/works";

export const metadata: Metadata = {
  title: "Resume · 作品集",
  description: "简历 · 个人影像作品集。",
};

type PlaceholderProps = {
  label: string;
  width?: "sm" | "md" | "lg" | "xl";
  italic?: boolean;
};

/**
 * Inline skeleton line — used wherever real content is missing.
 * Renders as a styled placeholder so the page reads as a design preview
 * without making up fabricated experience.
 */
function Placeholder({ label, width = "md", italic = true }: PlaceholderProps) {
  const widthMap: Record<NonNullable<PlaceholderProps["width"]>, string> = {
    sm: "w-24",
    md: "w-48",
    lg: "w-72",
    xl: "w-96",
  };
  return (
    <span
      className={`inline-block translate-y-[3px] border-b border-dashed border-[var(--mute-on-night)]/50 align-middle ${widthMap[width]}`}
      aria-label={`待填写:${label}`}
      data-placeholder={label}
    >
      <span
        className={`catalog-num text-[10px] text-[var(--mute-on-night)] ${italic ? "italic" : ""}`}
      >
        {label}
      </span>
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="catalog-num mt-12 flex items-center gap-3 text-[11px] text-[var(--paper-on-night)] first:mt-0">
      <span aria-hidden className="inline-block h-px w-6 bg-[var(--ember)]" />
      <span>{children}</span>
      <span aria-hidden className="inline-block h-px flex-1 bg-white/10" />
    </h2>
  );
}

export default function ResumePage() {
  return (
    <>
      <SiteHeader />
      <main
        className="cinematic cinematic-bg min-h-dvh overflow-x-hidden px-5 pb-24 pt-28 sm:px-0 sm:pt-32 print:max-w-none print:px-6"
        id="about"
      >
        <div className="mx-auto max-w-[680px] sm:mx-auto sm:px-0">
          {/* Identity */}
          <header className="border-b border-white/10 pb-10">
            <p className="catalog-num text-[10px] text-[var(--ember)]">
              RESUME · 简历
            </p>
            <h1
              className="display-headline mt-4"
              style={{
                fontSize: "clamp(48px, 7vw, 88px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              <Placeholder label="姓名 / Name" width="lg" />
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--mute-on-night)]">
              <Placeholder label="职位标题 / 一句话立场" width="xl" />
            </p>
          </header>

          {/* Summary */}
          <section>
            <SectionHeading>概要</SectionHeading>
            <div className="space-y-2 pt-4 text-[14px] leading-relaxed text-[var(--paper-on-night)]">
              <p>
                <Placeholder label="一段话自我介绍,2-3 行,描述工作范畴" width="xl" />
              </p>
              <p>
                <Placeholder label="第二句:目前感兴趣的方向" width="lg" />
              </p>
            </div>
          </section>

          {/* Experience */}
          <section>
            <SectionHeading>工作经历</SectionHeading>
            <ol className="mt-4 space-y-7">
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="公司 / 角色" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="2026 — Present" width="sm" italic={false} />
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                  <li>
                    <Placeholder label="一段职责 / 成就" width="xl" />
                  </li>
                  <li>
                    <Placeholder label="一段职责 / 成就" width="lg" />
                  </li>
                </ul>
              </li>
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="公司 / 角色" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="2024 — 2026" width="sm" italic={false} />
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                  <li>
                    <Placeholder label="一段职责 / 成就" width="xl" />
                  </li>
                </ul>
              </li>
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="公司 / 角色" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="更早期角色" width="sm" italic={false} />
                  </span>
                </div>
              </li>
            </ol>
          </section>

          {/* Selected works — pulls from works.ts so the page stays in sync */}
          <section>
            <SectionHeading>作品 · Selected Works</SectionHeading>
            <ol className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {works.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {w.title}
                    </span>
                    {w.description && (
                      <p className="mt-1 line-clamp-1 text-[12px] text-[var(--mute-on-night)]">
                        {w.description}
                      </p>
                    )}
                  </div>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    {w.year ?? ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Skills */}
          <section>
            <SectionHeading>技能</SectionHeading>
            <p className="mt-4 text-[14px] leading-loose text-[var(--paper-on-night)]">
              <Placeholder label="技能 A · 技能 B · 技能 C" width="xl" />
            </p>
          </section>

          {/* Contact */}
          <section>
            <SectionHeading>联系方式</SectionHeading>
            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-2 text-[14px]">
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">EMAIL</dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="name@example.com" width="md" italic={false} />
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">GITHUB</dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="@username" width="sm" italic={false} />
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">SITE</dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="your-domain.com" width="md" italic={false} />
              </dd>
            </dl>
          </section>

          <footer className="mt-16 border-t border-white/10 pt-4">
            <p className="catalog-num text-[10px] text-[var(--mute-on-night)]">
              设计稿 · Placeholder content. 编辑此文件即可替换为你自己的内容。
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
