import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderFallback } from "@/components/SiteHeaderFallback";
import { I18nProvider } from "@/lib/I18nContext";
import { getDictionary } from "@/lib/dictionaries";
import { localeBasePath as basePathFor } from "@/lib/i18n";

const dict = await getDictionary("en");

export const metadata: Metadata = {
  title: dict.resume.title,
  description: dict.resume.description,
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="catalog-num mt-16 flex items-center gap-3 text-[11px] text-[var(--paper-on-night)] first:mt-0">
      <span aria-hidden className="inline-block h-px w-6 bg-[var(--ember)]" />
      <span>{children}</span>
      <span aria-hidden className="inline-block h-px flex-1 bg-white/10" />
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="catalog-num mt-6 text-[10px] text-[var(--mute-on-night)]"
      style={{ letterSpacing: "0.18em" }}
    >
      {children}
    </p>
  );
}

function ContactBadge({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="catalog-num text-[10px] text-[var(--mute-on-night)]">
        {label}
      </span>
      <span className="text-[12px] text-[var(--paper-on-night)]">{value}</span>
    </>
  );
  const className =
    "focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 no-underline transition-colors duration-150 hover:border-white/25 hover:text-[var(--ember)]";
  if (href) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return <span className={className}>{inner}</span>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] tracking-[0.04em] text-[var(--paper-on-night)]/85">
      {children}
    </kbd>
  );
}

function ProjectCard({
  project,
  index,
  liveDemoLabel,
  coreContributionsLabel,
}: {
  project: (typeof dict.resume.projects)[number];
  index: number;
  liveDemoLabel: string;
  coreContributionsLabel: string;
}) {
  return (
    <article className="border-t border-white/10 pt-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="catalog-num text-[10px] text-[var(--mute-on-night)]">
            {String(index + 1).padStart(2, "0")} · {project.domain}
          </p>
          <h3
            className="mt-1 text-[19px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.title}
          </h3>
        </div>
        <p
          className="catalog-num text-[10px] text-[var(--mute-on-night)]"
          style={{ letterSpacing: "0.16em" }}
        >
          {project.period}
        </p>
      </header>

      <p className="mt-3 text-[13px] italic text-[var(--mute-on-night)]">
        {project.format}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--paper-on-night)]">
        {project.summary}
      </p>

      <SubHeading>{coreContributionsLabel}</SubHeading>
      <ul className="mt-2 list-inside list-disc space-y-1 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
        {project.contributions.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {project.liveUrl && (
        <p className="mt-4">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 text-[13px] text-[var(--ember)] no-underline transition-colors duration-150 hover:text-[var(--ember-soft)]"
          >
            <span className="catalog-num text-[10px]">
              {project.liveLabel ?? liveDemoLabel}
            </span>
            <span aria-hidden>↗</span>
          </a>
        </p>
      )}
    </article>
  );
}

export default function ResumePageEn() {
  const r = dict.resume;
  const basePath = basePathFor("en");

  return (
    <I18nProvider locale="en" dict={dict}>
      <Suspense
        fallback={<SiteHeaderFallback dict={dict} localeBasePath={basePath} />}
      >
        <SiteHeader />
      </Suspense>
      <main
        className="cinematic cinematic-bg min-h-dvh overflow-x-hidden px-5 pb-24 pt-28 sm:px-0 sm:pt-32 print:max-w-none print:px-6"
        id="about"
      >
        <div className="mx-auto max-w-[720px] sm:mx-auto sm:px-0">
          {/* Identity */}
          <header className="border-b border-white/10 pb-8">
            <p className="catalog-num text-[10px] text-[var(--ember)]">
              {r.sectionResume}
            </p>
            <h1
              className="display-headline mt-4 text-[var(--paper-on-night)]"
              style={{
                fontSize: "clamp(56px, 9vw, 112px)",
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
              }}
            >
              {r.name}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[var(--paper-on-night)]/85">
              {r.role}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ContactBadge
                label={r.contactEmail}
                value={r.email}
                href={`mailto:${r.email}`}
              />
              <ContactBadge
                label={r.contactGithub}
                value={`@${r.github}`}
                href={`https://github.com/${r.github}`}
              />
              <ContactBadge
                label={r.contactExperience}
                value={r.experienceYears}
              />
              <ContactBadge label={r.contactLocation} value={r.location} />
            </div>
          </header>

          {/* About Me */}
          <section>
            <SectionHeading>{r.sectionAbout}</SectionHeading>
            <ul className="mt-4 list-inside list-disc space-y-2 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
              {r.about.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          {/* Work Experience */}
          <section>
            <SectionHeading>{r.sectionExperience}</SectionHeading>
            <div className="mt-5 space-y-8">
              {r.experience.map((exp) => (
                <article key={exp.company}>
                  <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
                    <div>
                      <h3
                        className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--paper-on-night)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {exp.company}
                      </h3>
                      <p className="mt-1 text-[13px] text-[var(--mute-on-night)]">
                        {exp.role} · {exp.location} · {exp.domain}
                      </p>
                    </div>
                    <p
                      className="catalog-num text-[10px] text-[var(--mute-on-night)]"
                      style={{ letterSpacing: "0.16em" }}
                    >
                      {exp.period}
                    </p>
                  </header>

                  <SubHeading>{exp.summary}</SubHeading>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                    {exp.contributions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>

                  <SubHeading>{r.stack}</SubHeading>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {exp.stack.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Core Projects */}
          <section>
            <SectionHeading>{r.sectionProjects}</SectionHeading>
            <div className="mt-2 space-y-8">
              {r.projects.map((project, i) => (
                <ProjectCard
                  key={project.title}
                  project={project}
                  index={i}
                  liveDemoLabel={r.liveDemo}
                  coreContributionsLabel={r.coreContributions}
                />
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <SectionHeading>{r.sectionTechStack}</SectionHeading>
            <div className="mt-5 grid gap-6 sm:grid-cols-1">
              {r.techStack.map((group) => (
                <article key={group.category}>
                  <h3
                    className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--paper-on-night)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {group.category}
                  </h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 text-[14px] leading-relaxed text-[var(--paper-on-night)] marker:text-[var(--mute-on-night)]">
                    {group.items.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* Core Technical Breakthroughs */}
          <section>
            <SectionHeading>{r.sectionBreakthroughs}</SectionHeading>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full table-fixed border-collapse text-left text-[13px]">
                <thead className="bg-white/[0.04]">
                  <tr>
                    <th className="catalog-num w-[40%] border-b border-white/10 px-4 py-2.5 text-[10px] font-medium text-[var(--mute-on-night)]">
                      ⚔️ Challenges
                    </th>
                    <th className="catalog-num border-b border-white/10 px-4 py-2.5 text-[10px] font-medium text-[var(--mute-on-night)]">
                      🛡️ Solutions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.breakthroughs.map((row) => (
                    <tr
                      key={row.challenge}
                      className="align-top [&>td]:border-b [&>td]:border-white/[0.06] [&>td]:px-4 [&>td]:py-3 last:[&>td]:border-b-0"
                    >
                      <td className="font-semibold text-[var(--paper-on-night)]">
                        {row.challenge}
                      </td>
                      <td className="text-[var(--paper-on-night)]/85">
                        {row.solution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact */}
          <section>
            <SectionHeading>{r.sectionContact}</SectionHeading>
            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-2 text-[14px]">
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {r.contactEmail}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <a
                  href={`mailto:${r.email}`}
                  className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]"
                >
                  {r.email}
                </a>
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {r.contactGithub}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <a
                  href={`https://github.com/${r.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]"
                >
                  github.com/{r.github}
                </a>
              </dd>
              <dt className="catalog-num text-[10px] text-[var(--mute-on-night)]">
                {r.contactSite}
              </dt>
              <dd className="text-[var(--paper-on-night)]">
                <a
                  href={r.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring no-underline transition-colors duration-150 hover:text-[var(--ember)]"
                >
                  {r.siteUrl}
                </a>
              </dd>
            </dl>
          </section>

          <footer className="mt-16 border-t border-white/10 pt-4">
            <p className="catalog-num text-[10px] text-[var(--mute-on-night)]">
              Hari · Full-Stack Engineer (Frontend-leaning) · Shenzhen
            </p>
          </footer>
        </div>
      </main>
    </I18nProvider>
  );
}
