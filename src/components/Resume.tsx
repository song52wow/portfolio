"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nContext";

/**
 * Resume — Editorial Spread layout for the /resume page.
 *
 * One visual source of truth for both (zh) and (intl)/en. Pulls dict
 * from the shared I18nContext provided by each page's I18nProvider
 * (see src/app/(zh)/resume/page.tsx and src/app/(intl)/en/resume/page.tsx).
 *
 * Why a single component instead of two near-identical page.tsx files:
 * the layout is the only thing that differs from the previous copy —
 * copy itself comes from dictionaries. Keeping the markup in one file
 * means we can't drift between locales on a future tweak.
 *
 * Outline (top → bottom):
 *   <Hero>          — large display name + asymmetric stat tiles
 *   <ContactStrip>  — inline contact pills, replaces the bottom dl block
 *   <Intro>         — pull quote + remaining bullets
 *   <Experience>    — one company block, period · location · domain strip
 *   <Projects>      — 2-col card grid (mobile 1-col); details toggle
 *   <Stack>         — 4 category columns with tag clouds
 *   <Breakthroughs> — numbered challenge ↔ solution pairs
 *   <Footer>        — single contact line, replaces the duplicate <Contact>
 */
export function Resume() {
  const { dict } = useI18n();
  const r = dict.resume;

  return (
    <main
      id="about"
      className="cinematic cinematic-bg relative min-h-dvh overflow-x-hidden px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12 print:max-w-none print:px-6"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <ResumeHero
          name={r.name}
          role={r.role}
          kicker={r.sectionResume}
          heroLabel={r.heroLabel}
          statYears={r.statYears}
          statProjects={r.statProjects}
          statEmployers={r.statEmployers}
          hintSince={r.hintSince}
        />
        <ResumeContactStrip
          email={r.email}
          emailLabel={r.contactEmail}
          github={r.github}
          githubLabel={r.contactGithub}
          siteUrl={r.siteUrl}
          siteLabel={r.siteLinkLabel}
          experienceYears={r.experienceYears}
          experienceLabel={r.contactExperience}
          location={r.location}
          locationLabel={r.contactLocation}
          projectsCount={r.projects.length}
          experienceCount={r.experience.length}
        />

        <div className="resume-stagger">
          <ResumeIntro
            heading={r.sectionAbout}
            summaryHeading={r.sectionSummary}
            items={r.about}
          />
          <ResumeExperience
            heading={r.sectionExperience}
            stackLabel={r.stack}
            items={r.experience}
          />
          <ResumeProjects
            heading={r.sectionProjects}
            coreContributionsLabel={r.coreContributions}
            liveDemoLabel={r.liveDemo}
            detailsLabel={r.projectDetails}
            collapseLabel={r.projectCollapse}
            items={r.projects}
          />
          <ResumeStack
            heading={r.sectionTechStack}
            items={r.techStack}
          />
          <ResumeBreakthroughs
            heading={r.sectionBreakthroughs}
            challengeLabel={r.breakthroughChallenge}
            solutionLabel={r.breakthroughSolution}
            items={r.breakthroughs}
          />
        </div>

        <ResumeFooter
          contactLabel={r.footerContact}
          role={r.role}
          location={r.location}
          siteUrl={r.siteUrl}
          email={r.email}
          github={r.github}
        />
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------- */
/* Shared atoms                                                          */
/* -------------------------------------------------------------------- */

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <header id={id} className="mb-8 flex items-center gap-4 sm:mb-12">
      <span aria-hidden className="section-ember-bar h-px w-12 shrink-0 bg-[var(--ember)]" />
      <h2
        className="catalog-num text-[11px] uppercase tracking-[0.32em] text-[var(--paper-on-night)]/85"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {children}
      </h2>
      <span aria-hidden className="hairline flex-1" />
    </header>
  );
}

function HeroStat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="relative flex flex-col gap-1.5 border-l border-white/10 pl-4 first:border-l-0 first:pl-0 sm:border-l-0 sm:border-t sm:pt-4 sm:pl-0">
      <p
        className="display-headline text-[34px] leading-none tracking-[-0.04em] text-[var(--paper-on-night)] sm:text-[44px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p className="catalog-num text-[10px] text-[var(--mute-on-night)]">{label}</p>
      {hint && (
        <p className="text-[11px] leading-relaxed text-[var(--paper-on-night)]/55">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Hero + contact                                                        */
/* -------------------------------------------------------------------- */

function ResumeHero({
  name,
  role,
  kicker,
  heroLabel,
  statYears,
  statProjects,
  statEmployers,
  hintSince,
}: {
  name: string;
  role: string;
  kicker: string;
  heroLabel: string;
  statYears: string;
  statProjects: string;
  statEmployers: string;
  hintSince: string;
}) {
  return (
    <header className="grid grid-cols-1 gap-x-12 gap-y-10 border-b border-white/10 pb-12 lg:grid-cols-12 lg:pb-16">
      <div className="lg:col-span-8">
        <p
          className="catalog-num flex items-center gap-3 text-[11px] text-[var(--ember)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span aria-hidden className="inline-block h-px w-6 bg-[var(--ember)]" />
          {kicker}
        </p>
        <h1
          className="display-headline mt-6 text-[var(--paper-on-night)]"
          style={{
            fontSize: "clamp(72px, 12vw, 152px)",
            letterSpacing: "-0.055em",
            lineHeight: 0.88,
          }}
        >
          {name}
        </h1>
        <p
          className="mt-7 max-w-[42ch] text-[18px] leading-[1.6] text-[var(--paper-on-night)]/85 sm:text-[19px]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.005em" }}
        >
          {role}
        </p>
      </div>

      <aside className="self-end lg:col-span-4">
        <p
          className="catalog-num mb-3 text-[10px] text-[var(--mute-on-night)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {heroLabel}
        </p>
        {/* Desktop grid: 1-row horizontal; mobile: stacked. */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
          <HeroStat value="08+" label={statYears} hint={hintSince} />
          <HeroStat value="07" label={statProjects} />
          <HeroStat value="01" label={statEmployers} hint="2018 → 2026" />
        </div>
      </aside>
    </header>
  );
}

function ResumeContactStrip({
  email,
  emailLabel,
  github,
  githubLabel,
  siteUrl,
  siteLabel,
  experienceYears,
  experienceLabel,
  location,
  locationLabel,
  projectsCount,
  experienceCount,
}: {
  email: string;
  emailLabel: string;
  github: string;
  githubLabel: string;
  siteUrl: string;
  siteLabel: string;
  experienceYears: string;
  experienceLabel: string;
  location: string;
  locationLabel: string;
  projectsCount: number;
  experienceCount: number;
}) {
  const pills: Array<{ label: string; value: string; href?: string }> = [
    { label: emailLabel, value: email, href: `mailto:${email}` },
    { label: githubLabel, value: `@${github}`, href: `https://github.com/${github}` },
    { label: experienceLabel, value: experienceYears },
    { label: locationLabel, value: location },
  ];
  // The strip value isn't currently rendered, but kept here so the
  // unused-param lint stops complaining when we re-add it later.
  void projectsCount;
  void experienceCount;

  return (
    <div className="border-b border-white/10 py-6">
      <div className="flex flex-wrap gap-2">
        {pills.map((p, i) => {
          const inner = (
            <>
              <span
                className="catalog-num text-[10px] text-[var(--mute-on-night)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {p.label}
              </span>
              <span aria-hidden className="text-[var(--ghost-on-night)]">/</span>
              <span className="text-[12px] text-[var(--paper-on-night)]">{p.value}</span>
            </>
          );
          const className =
            "focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 no-underline transition-all duration-200 hover:-translate-y-px hover:border-[var(--ember)]/40 hover:bg-[var(--ember)]/[0.06]";
          return p.href ? (
            <a
              key={i}
              href={p.href}
              className={className}
              target={p.href.startsWith("http") ? "_blank" : undefined}
              rel={p.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {inner}
            </a>
          ) : (
            <span key={i} className={className}>
              {inner}
            </span>
          );
        })}
      </div>
      <p className="mt-4 hidden text-[10px] text-[var(--mute-on-night)] sm:block">
        {siteLabel} <a href={siteUrl} target="_blank" rel="noreferrer" className="focus-ring text-[var(--paper-on-night)]/70 no-underline transition-colors duration-150 hover:text-[var(--ember)]">{siteUrl.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Intro                                                                 */
/* -------------------------------------------------------------------- */

function ResumeIntro({
  heading,
  summaryHeading,
  items,
}: {
  heading: string;
  summaryHeading: string;
  items: readonly string[];
}) {
  const [head, ...rest] = items;
  return (
    <section className="pt-16 sm:pt-24">
      <SectionHeading>{heading}</SectionHeading>
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p
            className="catalog-num mb-3 text-[10px] text-[var(--ember)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {summaryHeading}
          </p>
          <p
            className="text-[22px] leading-[1.45] tracking-[-0.015em] text-[var(--paper-on-night)] sm:text-[28px]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            {head}
          </p>
        </div>
        {rest.length > 0 && (
          <ul className="space-y-4 text-[15px] leading-[1.7] text-[var(--paper-on-night)]/85 lg:col-span-7">
            {rest.map((line) => (
              <li key={line} className="flex gap-4">
                <span
                  aria-hidden
                  className="catalog-num mt-3 inline-block h-px w-4 shrink-0 bg-[var(--ember)]"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Experience                                                            */
/* -------------------------------------------------------------------- */

type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  domain: string;
  period: string;
  summary: string;
  contributions: readonly string[];
  stack: readonly string[];
};

function ResumeExperience({
  heading,
  stackLabel,
  items,
}: {
  heading: string;
  stackLabel: string;
  items: readonly ExperienceItem[];
}) {
  return (
    <section className="pt-20 sm:pt-28">
      <SectionHeading>{heading}</SectionHeading>
      <div className="space-y-12">
        {items.map((exp) => (
          <article key={exp.company}>
            <header className="grid grid-cols-1 gap-x-10 gap-y-4 border-b border-white/10 pb-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3
                  className="text-[28px] leading-[1.05] tracking-[-0.025em] text-[var(--paper-on-night)] sm:text-[34px]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {exp.company}
                </h3>
                <p className="mt-2 text-[14px] text-[var(--mute-on-night)]">
                  <span className="text-[var(--paper-on-night)]/85">{exp.role}</span>
                  <span className="mx-2 text-[var(--ghost-on-night)]">·</span>
                  {exp.location}
                  <span className="mx-2 text-[var(--ghost-on-night)]">·</span>
                  {exp.domain}
                </p>
              </div>
              <p
                className="catalog-num self-end text-[11px] text-[var(--mute-on-night)] sm:text-right lg:col-span-5"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em" }}
              >
                {exp.period}
              </p>
            </header>

            <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p
                  className="catalog-num mb-3 text-[10px] text-[var(--mute-on-night)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {exp.summary}
                </p>
                <ul className="space-y-3 text-[14.5px] leading-[1.7] text-[var(--paper-on-night)]/90">
                  {exp.contributions.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ember)]/80" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-4">
                <p
                  className="catalog-num mb-3 text-[10px] text-[var(--mute-on-night)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {stackLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.stack.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10.5px] tracking-[0.02em] text-[var(--paper-on-night)]/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Projects                                                              */
/* -------------------------------------------------------------------- */

type ProjectItem = {
  title: string;
  domain: string;
  period: string;
  format: string;
  summary: string;
  contributions: readonly string[];
  tags: readonly string[];
  liveUrl?: string;
  liveLabel?: string;
};

function ProjectCard({
  project,
  index,
  liveDemoLabel,
  coreContributionsLabel,
  detailsLabel,
  collapseLabel,
}: {
  project: ProjectItem;
  index: number;
  liveDemoLabel: string;
  coreContributionsLabel: string;
  detailsLabel: string;
  collapseLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Smooth height transition for the collapsible details panel.
  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    el.style.height = open ? `${el.scrollHeight}px` : "0px";
  }, [open]);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-px hover:border-[var(--ember)]/40 hover:bg-white/[0.04] sm:p-7">
      <header className="flex items-start justify-between gap-4">
        <p
          className="catalog-num text-[10px] text-[var(--mute-on-night)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {String(index + 1).padStart(2, "0")} · {project.domain}
        </p>
        <p
          className="catalog-num text-[10px] text-[var(--mute-on-night)]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}
        >
          {project.period}
        </p>
      </header>

      <h3
        className="mt-4 text-[19px] leading-[1.2] tracking-[-0.025em] text-[var(--paper-on-night)] sm:text-[20px]"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        {project.title}
      </h3>

      <p className="mt-3 text-[12.5px] italic text-[var(--mute-on-night)]">{project.format}</p>
      <p className="mt-3 text-[14px] leading-[1.65] text-[var(--paper-on-night)]/85">{project.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[var(--paper-on-night)]/85 transition-colors duration-150 hover:border-[var(--ember)]/45 hover:text-[var(--ember)]"
        >
          <span className="catalog-num" style={{ fontFamily: "var(--font-mono)" }}>
            {open ? collapseLabel : detailsLabel}
          </span>
          <span
            aria-hidden
            className={`inline-block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-[12px] text-[var(--ember)] no-underline transition-colors duration-150 hover:text-[var(--ember-soft)]"
          >
            <span className="catalog-num text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
              {project.liveLabel ?? liveDemoLabel}
            </span>
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>

      <div
        ref={detailsRef}
        className="resume-collapse mt-5 overflow-hidden"
        style={{ height: 0 }}
      >
        <div className="border-t border-white/10 pt-4">
          <p
            className="catalog-num mb-2 text-[10px] text-[var(--mute-on-night)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {coreContributionsLabel}
          </p>
          <ul className="space-y-2 text-[13.5px] leading-[1.65] text-[var(--paper-on-night)]/90">
            {project.contributions.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--ember)]/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10.5px] tracking-[0.02em] text-[var(--paper-on-night)]/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ResumeProjects({
  heading,
  coreContributionsLabel,
  liveDemoLabel,
  detailsLabel,
  collapseLabel,
  items,
}: {
  heading: string;
  coreContributionsLabel: string;
  liveDemoLabel: string;
  detailsLabel: string;
  collapseLabel: string;
  items: readonly ProjectItem[];
}) {
  return (
    <section className="pt-20 sm:pt-28">
      <SectionHeading>{heading}</SectionHeading>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map((project, i) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={i}
            liveDemoLabel={liveDemoLabel}
            coreContributionsLabel={coreContributionsLabel}
            detailsLabel={detailsLabel}
            collapseLabel={collapseLabel}
          />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Stack                                                                 */
/* -------------------------------------------------------------------- */

type StackItem = { category: string; items: readonly string[] };

function ResumeStack({
  heading,
  items,
}: {
  heading: string;
  items: readonly StackItem[];
}) {
  return (
    <section className="pt-20 sm:pt-28">
      <SectionHeading>{heading}</SectionHeading>
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
        {items.map((group, i) => (
          <article key={group.category}>
            <header className="mb-4 flex items-baseline gap-3 border-b border-white/10 pb-3">
              <span
                className="catalog-num text-[11px] text-[var(--ember)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                0{i + 1}
              </span>
              <h3
                className="text-[16px] tracking-[-0.015em] text-[var(--paper-on-night)] sm:text-[17px]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                {group.category}
              </h3>
            </header>
            <ul className="space-y-2.5 text-[13.5px] leading-[1.7] text-[var(--paper-on-night)]/85">
              {group.items.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden className="mt-2 inline-block h-px w-3 shrink-0 bg-white/25" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Breakthroughs                                                         */
/* -------------------------------------------------------------------- */

type Breakthrough = { challenge: string; solution: string };

function ResumeBreakthroughs({
  heading,
  challengeLabel,
  solutionLabel,
  items,
}: {
  heading: string;
  challengeLabel: string;
  solutionLabel: string;
  items: readonly Breakthrough[];
}) {
  return (
    <section className="pt-20 sm:pt-28">
      <SectionHeading>{heading}</SectionHeading>
      <ol className="space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015]">
        {items.map((row, i) => (
          <li
            key={row.challenge}
            className="grid grid-cols-1 gap-4 border-b border-white/[0.07] px-5 py-6 last:border-b-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6 sm:px-7 sm:py-7"
          >
            <span
              className="catalog-num text-[11px] text-[var(--mute-on-night)] sm:self-start sm:pt-1"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.18em" }}
            >
              0{i + 1}
            </span>
            <div>
              <p
                className="catalog-num mb-1 text-[10px] text-[var(--ember)] sm:hidden"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {challengeLabel}
              </p>
              <p
                className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--paper-on-night)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {row.challenge}
              </p>
            </div>
            <div>
              <p
                className="catalog-num mb-1 text-[10px] text-[var(--mute-on-night)] sm:hidden"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {solutionLabel}
              </p>
              <p className="text-[14px] leading-[1.7] text-[var(--paper-on-night)]/85">
                {row.solution}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

function ResumeFooter({
  contactLabel,
  role,
  location,
  siteUrl,
  email,
  github,
}: {
  contactLabel: string;
  role: string;
  location: string;
  siteUrl: string;
  email: string;
  github: string;
}) {
  return (
    <footer className="mt-20 border-t border-white/10 pt-8 sm:mt-28">
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10">
        <div>
          <p
            className="catalog-num mb-2 text-[10px] text-[var(--mute-on-night)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {contactLabel}
          </p>
          <p className="text-[14px] leading-relaxed text-[var(--paper-on-night)]/90">
            <a href={`mailto:${email}`} className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]">
              {email}
            </a>
            <span className="mx-2 text-[var(--ghost-on-night)]">/</span>
            <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer" className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]">
              @{github}
            </a>
            <span className="mx-2 text-[var(--ghost-on-night)]">/</span>
            <a href={siteUrl} target="_blank" rel="noreferrer" className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]">
              {siteUrl.replace(/^https?:\/\//, "")}
            </a>
          </p>
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--mute-on-night)] sm:text-right">
          Hari · {role} · {location}
        </p>
      </div>
      <p
        className="catalog-num mt-6 text-[10px] text-[var(--mute-on-night)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        © Hari · Exhibition Works
      </p>
    </footer>
  );
}

/* unused — kept to avoid an unused-import lint surprise if added later. */
void Link;
