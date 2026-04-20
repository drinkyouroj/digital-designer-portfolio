import HeroGL from "@/components/HeroGL";
import ScrollGate from "@/components/ScrollGate";
import CaseStudyGrid from "@/components/CaseStudyGrid";
import LiveTime from "@/components/LiveTime";
import PixelCharacter from "@/components/PixelCharacter";
import SpeechBubble from "@/components/SpeechBubble";
import Marquee from "@/components/Marquee";
import Link from "next/link";

const SKILLS =
  "UX / UI · MOBILE · WEB · VISUAL · MOTION · ART DIRECTION · PRODUCT · DESIGN SYSTEMS · RESEARCH · ACCESSIBILITY · PROTOTYPING · NO-CODE";

const EXPERIMENTS = [
  { title: "Type Exploration", year: "2025", device: "desktop" },
  { title: "Motion Studies",   year: "2025", device: "mobile"  },
  { title: "Color System",     year: "2024", device: "tablet"  },
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
          <a href="mailto:hello@sethlukin.com" data-cursor="finger" className="hover:text-white">
            Hello@sethlukin.com
          </a>
          <a
            href="https://linkedin.com/in/sethlukin"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="finger"
            className="hover:text-white"
          >
            LinkedIn.com/in/sethlukin
          </a>
        </div>

        {/* Center stack: wordmark left, character+bubble center, wordmark right */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <h1
              className="font-display font-bold uppercase text-white leading-none"
              style={{ fontSize: "clamp(3.5rem, 15vw, 16rem)", letterSpacing: "-0.05em" }}
            >
              Seth
            </h1>

            <div className="flex flex-col items-center gap-3 relative">
              <SpeechBubble>Open to Work!</SpeechBubble>
              <PixelCharacter size={140} />
            </div>

            <h1
              className="font-display font-bold uppercase text-white leading-none"
              style={{ fontSize: "clamp(3.5rem, 15vw, 16rem)", letterSpacing: "-0.05em" }}
            >
              Lukin
            </h1>
          </div>
        </div>

        {/* Bottom meta */}
        <div
          className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end font-mono text-[11px] uppercase tracking-widest"
          style={{ color: "#CCCCCC" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-white">Digital Product Designer</span>
            <span>Based in New York City · <LiveTime /></span>
          </div>
          <div className="flex flex-col md:items-end gap-1">
            <span>UX · Web · Interaction · Motion · Visual</span>
            <span className="opacity-60">↓ Scroll</span>
          </div>
        </div>
      </section>

      {/* ── Scrolling content — opaque dark bg covers the sticky hero ── */}
      <div className="relative" style={{ zIndex: 10, backgroundColor: "#0A0A0A" }}>

        <Marquee />

        <section className="px-6 pt-20 pb-24 md:px-10">
          <h2 className="font-mono text-xs uppercase tracking-widest mb-10" style={{ color: "#888" }}>
            Case Studies
          </h2>
          <CaseStudyGrid />
        </section>

        <section
          className="px-6 py-24 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest mb-10" style={{ color: "#888" }}>
            Experiments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXPERIMENTS.map((e) => (
              <div
                key={e.title}
                className="rounded-xl flex items-end p-5"
                style={{ backgroundColor: "#141414", aspectRatio: "16/9" }}
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "#6E6E6E" }}>
                    {e.year} · {e.device}
                  </p>
                  <h3 className="font-sans font-semibold text-lg text-white">{e.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="px-6 py-16 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <p className="font-sans text-sm leading-loose" style={{ color: "#888" }}>
            {SKILLS}
          </p>
        </section>

        <footer
          className="px-6 py-16 md:px-10"
          style={{ borderTop: "1px solid #1E1E1E" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
            <div className="flex flex-col gap-2">
              <a
                href="mailto:hello@sethlukin.com"
                data-cursor="finger"
                className="font-display text-2xl font-semibold text-white uppercase tracking-tight hover:text-vermillion transition-colors"
              >
                Hello@sethlukin.com
              </a>
              <a
                href="https://linkedin.com/in/sethlukin"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="finger"
                className="font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
                style={{ color: "#888" }}
              >
                LinkedIn.com/in/sethlukin
              </a>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#888" }}>
                The New School, New York
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
            © 2025 · Designed &amp; built with care
          </p>
        </footer>
      </div>
    </>
  );
}
