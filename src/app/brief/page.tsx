import Link from "next/link";

export const metadata = { title: "Start a Project" };

export default function BriefPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <h1
        className="font-sans font-bold uppercase text-ink text-center leading-none"
        style={{ fontSize: "clamp(2rem, 8vw, 8rem)", letterSpacing: "-0.04em" }}
      >
        Start a Project
      </h1>
      <p className="font-sans text-lg text-mute mt-6 max-w-lg text-center">
        Get in touch and let&apos;s talk about what you&apos;re building.
      </p>
      <a
        href="mailto:hello@sethlukin.com"
        className="mt-10 inline-block px-8 py-4 rounded-full bg-vermillion text-panel font-sans text-sm uppercase tracking-wider hover:bg-ink transition-colors"
      >
        hello@sethlukin.com
      </a>
      <Link
        href="/"
        className="mt-6 font-mono text-xs text-mute uppercase tracking-widest hover:text-ink transition-colors"
      >
        ← Back
      </Link>
    </div>
  );
}
