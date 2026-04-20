"use client";

import { useEffect } from "react";

// Pauses expensive GL layers when scrolled >120vh away from them.
// Extracted from sethlukin.com's inline scroll-gate pattern.
export default function ScrollGate() {
  useEffect(() => {
    const HERO   = document.querySelector<HTMLElement>('[data-gl="hero"]');
    const FOOTER = document.querySelector<HTMLElement>('[data-gl="footer"]');
    if (!HERO && !FOOTER) return;

    const TH_VH = 120;
    let ticking = false;
    let heroHidden: boolean | null = null;
    let footerHidden: boolean | null = null;
    const vhPx = (m: number) => window.innerHeight * (m / 100);
    const setHidden = (el: HTMLElement, hide: boolean) =>
      el.classList[hide ? "add" : "remove"]("offscreen");

    function update() {
      ticking = false;
      const scrollY = window.scrollY || 0;
      const limitPx = vhPx(TH_VH);

      if (HERO) {
        const want = scrollY > limitPx;
        if (want !== heroHidden) setHidden(HERO, (heroHidden = want));
      }
      if (FOOTER) {
        const bottomGap =
          document.documentElement.scrollHeight - (scrollY + innerHeight);
        const want = bottomGap > limitPx;
        if (want !== footerHidden) setHidden(FOOTER, (footerHidden = want));
      }
    }

    function onScrollResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);
    update();

    return () => {
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
    };
  }, []);

  return null;
}
