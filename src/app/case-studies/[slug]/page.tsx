import Link from "next/link";
import { notFound } from "next/navigation";

const PROJECTS: Record<string, { title: string; year: string; desc: string; href?: string }> = {
  "ghost-editor": {
    title: "GhostEditor",
    year:  "2026",
    desc:  "AI developmental editor for self-published authors. Analyzes manuscripts chapter-by-chapter, generates story bibles from opening chapters, flags continuity errors.",
  },
  "thread-cartographer": {
    title: "Thread Cartographer",
    year:  "2025",
    desc:  "Transforms Reddit comment threads into interactive force-directed graphs.",
  },
  "intakeform-ai": {
    title: "IntakeForm-AI",
    year:  "2025",
    desc:  "AI-powered intake form system that reduces manual data entry through intelligent form processing.",
  },
};

export function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = PROJECTS[params.slug];
  return { title: p ? `${p.title} — Project` : "Not Found" };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const p = PROJECTS[params.slug];
  if (!p) notFound();

  return (
    <div className="min-h-screen px-6 pt-24 pb-32 md:px-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
        style={{ color: "#888" }}
      >
        ← Work
      </Link>

      <p className="font-mono text-xs uppercase tracking-widest mt-16 mb-2" style={{ color: "#888" }}>
        {p.year}
      </p>
      <h1
        className="font-display font-black uppercase text-white leading-none"
        style={{ fontSize: "clamp(2.5rem, 8vw, 8rem)", letterSpacing: "-0.04em" }}
      >
        {p.title}
      </h1>
      <p className="font-sans text-xl mt-4" style={{ color: "#B2B2B2" }}>{p.desc}</p>

      {/* Cover placeholder */}
      <div className="w-full aspect-video rounded-2xl mt-12" style={{ backgroundColor: "#141414" }} />

      <p className="font-sans text-lg text-white mt-16 max-w-2xl leading-relaxed">
        Case study content coming soon. Replace this with project narrative,
        process documentation, and outcome metrics.
      </p>
    </div>
  );
}
