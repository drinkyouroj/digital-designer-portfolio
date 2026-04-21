import Link from "next/link";

export const metadata = { title: "Start a Project — Justin Hearn" };

export default function BriefPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <h1
        className="font-display font-black uppercase text-white text-center leading-none"
        style={{ fontSize: "clamp(2rem, 8vw, 8rem)", letterSpacing: "-0.04em" }}
      >
        Let&apos;s Build
      </h1>
      <p className="font-sans text-lg mt-6 max-w-lg text-center" style={{ color: "#B2B2B2" }}>
        15+ years of systems thinking, amplified by AI. Tell me what you&apos;re building.
      </p>
      <a
        href="mailto:hello@justin.hearn.me"
        data-cursor="finger"
        className="mt-10 inline-block px-8 py-4 rounded-full bg-vermillion text-white font-sans text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
      >
        hello@justin.hearn.me
      </a>
      <Link
        href="/"
        data-cursor="finger"
        className="mt-6 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
        style={{ color: "#888" }}
      >
        ← Back
      </Link>
    </div>
  );
}
