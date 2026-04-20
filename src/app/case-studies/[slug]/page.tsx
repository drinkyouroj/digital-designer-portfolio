import Link from "next/link";
import { notFound } from "next/navigation";

const PROJECTS: Record<string, { title: string; year: string; desc: string }> = {
  luuna:     { title: "Luuna",     year: "2024", desc: "Sleep & wellness brand design" },
  twinby:    { title: "Twinby",    year: "2023", desc: "Social discovery platform" },
  "adc-space": { title: "ADC Space", year: "2023", desc: "Creative community hub" },
};

export function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = PROJECTS[params.slug];
  return { title: p ? `${p.title} — Case Study` : "Not Found" };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const p = PROJECTS[params.slug];
  if (!p) notFound();

  return (
    <div className="min-h-screen px-6 pt-24 pb-32 md:px-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="font-mono text-xs text-mute uppercase tracking-widest hover:text-ink transition-colors"
      >
        ← Work
      </Link>

      <p className="font-mono text-xs text-mute uppercase tracking-widest mt-16 mb-2">
        {p.year}
      </p>
      <h1
        className="font-sans font-bold uppercase text-ink leading-none"
        style={{ fontSize: "clamp(2.5rem, 8vw, 8rem)", letterSpacing: "-0.04em" }}
      >
        {p.title}
      </h1>
      <p className="font-sans text-xl text-mute mt-4">{p.desc}</p>

      {/* Cover placeholder */}
      <div className="w-full aspect-video bg-line rounded-2xl mt-12" />

      <p className="font-sans text-lg text-ink mt-16 max-w-2xl leading-relaxed">
        Case study content coming soon. Replace this with project narrative,
        process documentation, and outcome metrics.
      </p>
    </div>
  );
}
