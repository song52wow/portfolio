import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/data/works";

type WorkCardProps = {
  work: Work;
};

export function WorkCard({ work }: WorkCardProps) {
  return (
    <article className="group">
      <Link
        href={`/works/${work.slug}`}
        className="block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-600"
      >
        <div className="relative aspect-video overflow-hidden bg-zinc-950">
          <Image
            src={work.thumbnailSrc}
            alt={`${work.title} 缩略图`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="text-lg font-medium text-zinc-100">{work.title}</h2>
            {work.year && (
              <span className="shrink-0 text-sm text-zinc-500">{work.year}</span>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-zinc-400">{work.description}</p>
          {work.tags && work.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="标签">
              {work.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}
