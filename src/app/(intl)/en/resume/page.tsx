import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderFallback } from "@/components/SiteHeaderFallback";
import { works } from "@/data/works";
import { I18nProvider } from "@/lib/I18nContext";
import { getDictionary } from "@/lib/dictionaries";
import { getWorkTranslation, localeBasePath as basePathFor } from "@/lib/i18n";

const dict = await getDictionary("en");

export const metadata: Metadata = {
  title: dict.resume.title,
  description: dict.resume.description,
};

type PlaceholderProps = {
  label: string;
  width?: "sm" | "md" | "lg" | "xl";
  italic?: boolean;
};

/**
 * Inline skeleton line — used wherever real content is missing.
 * Renders as a styled placeholder so the page reads as a design preview
 * without making up fabricated experience. Placeholder labels stay in
 * the author's authoring language (Chinese, with English hints in the
 * zip) — they're not user-facing UI copy.
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

export default function ResumePageEn() {
  return (
    <I18nProvider locale="en" dict={dict}>
      <Suspense
        fallback={<SiteHeaderFallback dict={dict} localeBasePath={basePathFor("en")} />}
      >
        <SiteHeader />
      </Suspense>
      <main
        className="cinematic cinematic-bg min-h-dvh overflow-x-hidden px-5 pb-24 pt-28 sm:px-0 sm:pt-32 print:max-w-none print:px-6"
        id="about"
      >
        <div className="mx-auto max-w-[680px] sm:mx-auto sm:px-0">
          {/* Identity */}
          <header className="border-b border-white/10 pb-10">
            <p className="catalog-num text-[10px] text-[var(--ember)]">
              {dict.resume.sectionResume}
            </p>
            <h1
              className="display-headline mt-4"
              style={{
                fontSize: "clamp(48px, 7vw, 88px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
              }}
            >
              <Placeholder label="Name / 姓名" width="lg" />
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--mute-on-night)]">
              <Placeholder label="Title / one-line stance" width="xl" />
            </p>
          </header>

          {/* Summary */}
          <section>
            <SectionHeading>{dict.resume.sectionSummary}</SectionHeading>
            <div className="space-y-2 pt-4 text-[14px] leading-relaxed text-[var(--paper-on-night)]">
              <p>
                <Placeholder label="2-3 line self-intro describing your work" width="xl" />
              </p>
              <p>
                <Placeholder label="Second sentence: current interests" width="lg" />
              </p>
            </div>
          </section>

          {/* Experience */}
          <section>
            <SectionHeading>{dict.resume.sectionExperience}</SectionHeading>
            <ol className="mt-4 space-y-7">
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="Company / Role" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="2026 — Present" width="sm" italic={false} />
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                  <li>
                    <Placeholder label="Responsibility / achievement" width="xl" />
                  </li>
                  <li>
                    <Placeholder label="Responsibility / achievement" width="lg" />
                  </li>
                </ul>
              </li>
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="Company / Role" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="2024 — 2026" width="sm" italic={false} />
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                  <li>
                    <Placeholder label="Responsibility / achievement" width="xl" />
                  </li>
                </ul>
              </li>
              <li>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3
                    className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Placeholder label="Company / Role" width="lg" />
                  </h3>
                  <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                    <Placeholder label="Earlier role" width="sm" italic={false} />
                  </span>
                </div>
              </li>
            </ol>
          </section>

          {/* Selected works — pulls from works.ts so the page stays in sync */}
          <section>
            <SectionHeading>{dict.resume.sectionWorks}</SectionHeading>
            <ol className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {works.map((w) => {
                const title = getWorkTranslation(dict, w.slug)?.title ?? w.title;
                const description =
                  getWorkTranslation(dict, w.slug)?.description ?? w.description;
                return (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[var(--paper-on-night)]"
                        style={{ fontFamily: "var(--font-display)" }}
                        title={title}
                      >
                        {title}
                      </span>
                      {description && (
                        <p className="mt-1 line-clamp-1 text-[12px] text-[var(--mute-on-night)]">
                          {description}
                        </p>
                      )}
                    </div>
                    <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                      {w.year ?? ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Skills */}
          <section>
            <SectionHeading>{dict.resume.sectionSkills}</SectionHeading>
            <p className="mt-4 text-[14px] leading-loose text-[var(--paper-on-night)]">
              <Placeholder label="Skill A · Skill B · Skill C" width="xl" />
            </p>
          </section>

          {/* Contact */}
          <section>
            <SectionHeading>{dict.resume.sectionContact}</SectionHeading>
            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-2 text-[14px]">
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {dict.resume.contactEmail}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="name@example.com" width="md" italic={false} />
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {dict.resume.contactGithub}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="@username" width="sm" italic={false} />
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {dict.resume.contactSite}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <Placeholder label="your-domain.com" width="md" italic={false} />
              </dd>
            </dl>
          </section>

          <footer className="mt-16 border-t border-white/10 pt-4">
            <p className="catalog-num text-[10px] text-[var(--mute-on-night)]">
              Design preview · Placeholder content. Edit this file to replace with your own.
            </p>
          </footer>
        </div>
      </main>
    </I18nProvider>
  );
}