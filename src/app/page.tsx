import HeroGL from "@/components/HeroGL";
import ScrollGate from "@/components/ScrollGate";
import CaseStudyGrid from "@/components/CaseStudyGrid";
import PixelCharacter from "@/components/PixelCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import Marquee from "@/components/Marquee";
import Link from "next/link";

const SKILLS =
  "SYSTEMS THINKING · AI INTEGRATION · CLAUDE API · NEXT.JS · FASTAPI · POSTGRESQL · INFRASTRUCTURE · INCIDENT RESPONSE · AUTOMATION · DATA VISUALIZATION";

const WRITING = [
  {
    title: "Obsidian Was Never the Problem",
    date: "Apr 2026",
    href: "https://drinkyouroj.substack.com",
  },
];

export default function Home() {
  return (
    <>
      <HeroGL />
      <ScrollGate />

      {/* ── Hero — sticky pin, sits BEHIND scrolling content ── */}
      <section
        id="hero"
        className="sticky top-0 h-screen flex flex-col px-6 py-6 md:px-10"
        style={{ zIndex: 1 }}
      >
        {/* Top nav */}
        <div
          className="flex justify-between items-center font-mono text-[11px] uppercase tracking-widest"
          style={{ color: "#CCCCCC" }}
        >
          <a href="mailto:hello@justin.hearn.me" data-cursor="finger" className="hover:text-white">
            Hello@justin.hearn.me
          </a>
          <a
            href="https://linkedin.com/in/jhearn/"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="finger"
            className="hover:text-white"
          >
            LinkedIn.com/in/jhearn
          </a>
        </div>

        {/* Center stack: wordmark left, character+bubble center, wordmark right */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-end justify-center gap-2 md:gap-4">
            <h1
              className="font-display font-black uppercase text-white leading-[0.85]"
              style={{ fontSize: "clamp(4rem, 18vw, 18rem)", letterSpacing: "-0.06em" }}
            >
              Justin
            </h1>

            <div className="flex flex-col items-center relative self-end" style={{ marginBottom: "-2%" }}>
              <div style={{ marginBottom: "12px" }}>
                <SpeechBubble>Let&apos;s Build!</SpeechBubble>
              </div>
              <PixelCharacter size={240} />
            </div>

            <h1
              className="font-display font-black uppercase text-white leading-[0.85]"
              style={{ fontSize: "clamp(4rem, 18vw, 18rem)", letterSpacing: "-0.06em" }}
            >
              Hearn
            </h1>
          </div>
        </div>

        {/* Bottom meta — 3 columns so ▼ sits dead center */}
        <div
          className="grid grid-cols-3 items-end font-mono text-[11px] uppercase tracking-widest"
          style={{ color: "#CCCCCC" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-white">AI-Augmented Engineering</span>
            <span>Based in Southeast Michigan</span>
          </div>
          <div className="flex justify-center text-white text-base">▼</div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span>Systems, AI Integration,</span>
            <span>Full-Stack, Infrastructure</span>
          </div>
        </div>
      </section>

      {/* ── Scrolling content — opaque dark bg covers the sticky hero ── */}
      <div className="relative" style={{ zIndex: 10, backgroundColor: "#0A0A0A" }}>

        <Marquee />

        {/* ── Projects ── */}
        <section className="px-6 pt-20 pb-24 md:px-10">
          <h2 className="font-mono text-xs uppercase tracking-widest mb-10" style={{ color: "#888" }}>
            Selected Projects
          </h2>
          <CaseStudyGrid />
        </section>

        {/* ── Writing ── */}
        <section
          className="px-6 py-24 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: "#888" }}>
              Writing
            </h2>
            <a
              href="https://drinkyouroj.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="finger"
              className="font-mono text-xs uppercase tracking-widest hover:text-white"
              style={{ color: "#888" }}
            >
              drinkyouroj.substack.com →
            </a>
          </div>
          <ul className="flex flex-col">
            {WRITING.map((w) => (
              <li key={w.title} style={{ borderTop: "1px solid #1E1E1E" }}>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="finger"
                  className="group flex items-baseline justify-between py-6 hover:text-vermillion transition-colors"
                >
                  <h3 className="font-display font-semibold text-2xl md:text-3xl text-white group-hover:text-vermillion">
                    {w.title}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "#888" }}>
                    {w.date}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Skills ── */}
        <section
          className="px-6 py-16 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <p className="font-sans text-sm leading-loose" style={{ color: "#888" }}>
            {SKILLS}
          </p>
        </section>

        {/* ── Footer ── */}
        <footer
          className="px-6 py-16 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
            <div className="flex flex-col gap-2">
              <a
                href="mailto:hello@justin.hearn.me"
                data-cursor="finger"
                className="font-display text-2xl font-semibold text-white uppercase tracking-tight hover:text-vermillion transition-colors"
              >
                Hello@justin.hearn.me
              </a>
              <div className="flex gap-4 font-mono text-xs uppercase tracking-widest" style={{ color: "#888" }}>
                <a
                  href="https://github.com/drinkyouroj"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="finger"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <span>·</span>
                <a
                  href="https://linkedin.com/in/jhearn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="finger"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
                <span>·</span>
                <a
                  href="https://drinkyouroj.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="finger"
                  className="hover:text-white transition-colors"
                >
                  Substack
                </a>
                <span>·</span>
                <a
                  href="https://standardresume.co/r/justinhearn"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="finger"
                  className="hover:text-white transition-colors"
                >
                  Résumé
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#888" }}>
                15+ yrs · Meta Reality Labs · Rackspace
              </p>
              <Link
                href="/brief"
                data-cursor="finger"
                className="inline-block px-6 py-3 rounded-full bg-white text-black font-sans text-sm uppercase tracking-wider hover:bg-vermillion hover:text-white transition-colors"
              >
                Start a Project →
              </Link>
            </div>
          </div>

          <p className="font-mono text-xs mt-12 uppercase tracking-widest" style={{ color: "#555" }}>
            © 2026 Justin Hearn · Built with Claude
          </p>
        </footer>
      </div>
    </>
  );
}
