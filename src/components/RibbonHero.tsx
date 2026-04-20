"use client";

import { useEffect, useRef, useState } from "react";

// ── Baked-in config (design defaults for Justin Hearn) ─────────────
const C = {
  pixel: 3, quant: 1, dither: false,
  count: 35, width: 14, length: 200, speed: 36,
  turb: 50, flow: 335, swirl: 71,
  mMode: "flow", mStr: 126, mRadius: 335,
  mTrail: true, mParallax: true, fade: 14,
  palette: 5, bgColor: "#0b0b0d",
  hue: 23, sat: 100, bri: 150,
  rgbsplit: false, invert: false, scanlines: true,
};

const PALETTES = [
  ["#ff3b00","#ff8a3b","#ffd08a","#f3f3ef"], // ember
  ["#ff2fa0","#7a2bff","#2bb8ff","#7aff7a"], // plasma
  ["#f3f3ef","#b9b9b5","#585858","#1a1a1a"], // mono
  ["#00c2a8","#4ce0b3","#ffd56b","#ff6b6b"], // reef
  ["#ff0040","#ffffff","#888888","#202020"], // noir
  ["#00fff0","#ff00c8","#fffb00","#0a0a12"], // cyber
  ["#2e7d32","#a5d66a","#f4e3b2","#6b3e2e"], // forest
];

// ── Value noise (smooth Perlin-ish, no deps) ───────────────────────
function makeNoise(seed = 42) {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const SZ = 256;
  const vals = new Float32Array(SZ * SZ);
  for (let i = 0; i < vals.length; i++) vals[i] = rand();
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const x0 = ((xi % SZ) + SZ) % SZ, y0 = ((yi % SZ) + SZ) % SZ;
    const x1 = (x0 + 1) % SZ,         y1 = (y0 + 1) % SZ;
    const a = vals[y0*SZ+x0], b = vals[y0*SZ+x1];
    const c = vals[y1*SZ+x0], d = vals[y1*SZ+x1];
    const u = sm(x - xi), v = sm(y - yi);
    return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
  };
}

// ── Color helpers ──────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c+c).join("") : h, 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

function adjustColor([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r/255, gn = g/255, bn = b/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
  let h = 0, s = 0;
  const l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if      (max === rn) h = ((gn-bn)/d + (gn<bn?6:0)) * 60;
    else if (max === gn) h = ((bn-rn)/d + 2) * 60;
    else                 h = ((rn-gn)/d + 4) * 60;
  }
  const hh = (h + C.hue + 360) % 360;
  const ss = Math.max(0, Math.min(1, s * (C.sat/100)));
  const ll = Math.max(0, Math.min(1, l * (C.bri/100)));
  const cc = (1 - Math.abs(2*ll-1)) * ss;
  const hp = hh/60, x = cc*(1 - Math.abs(hp%2-1));
  let rp=0, gp=0, bp=0;
  if      (hp<1){rp=cc;gp=x;}
  else if (hp<2){rp=x;gp=cc;}
  else if (hp<3){gp=cc;bp=x;}
  else if (hp<4){gp=x;bp=cc;}
  else if (hp<5){rp=x;bp=cc;}
  else          {rp=cc;bp=x;}
  const m = ll - cc/2;
  return [Math.round((rp+m)*255), Math.round((gp+m)*255), Math.round((bp+m)*255)];
}

function qChan(v: number, steps: number) {
  if (steps <= 1) return v;
  const q = 255/(steps-1);
  return Math.round(Math.round(v/q)*q);
}

// ── Component ──────────────────────────────────────────────────────
export default function RibbonHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;   // non-null; closures capture this const
    const ctx    = canvas.getContext("2d")!;
    const low    = document.createElement("canvas");
    const lctx   = low.getContext("2d")!;
    const noise2 = makeNoise(42);
    const pal = PALETTES[C.palette];

    type Ribbon = { x:number; y:number; colorIdx:number; life:number; maxLife:number; w:number };
    let ribbons: Ribbon[] = [];
    let rafId: number | null = null;
    let last = performance.now();

    const mouse = {
      x: -9999, y: -9999, tx: -9999, ty: -9999,
      vx: 0, vy: 0, px: -9999, py: -9999,
      inside: false,
      trail: [] as { x:number; y:number; life:number }[],
    };

    const toLow = (cx: number, cy: number) => ({
      x: (cx / window.innerWidth)  * low.width,
      y: (cy / window.innerHeight) * low.height,
    });

    function resetRibbons() {
      const W = low.width, H = low.height;
      ribbons = Array.from({ length: C.count }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        colorIdx: i % pal.length,
        life: Math.random() * C.length,
        maxLife: C.length,
        w: C.width * (0.6 + Math.random() * 0.8),
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = window.innerHeight + "px";
      low.width  = Math.max(2, Math.floor(window.innerWidth  / C.pixel));
      low.height = Math.max(2, Math.floor(window.innerHeight / C.pixel));
      lctx.fillStyle = C.bgColor;
      lctx.fillRect(0, 0, low.width, low.height);
      resetRibbons();
    }

    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = low.width, H = low.height;

      // Fade toward bg
      lctx.globalCompositeOperation = "source-over";
      lctx.fillStyle = C.bgColor;
      lctx.globalAlpha = Math.max(0.02, C.fade / 100);
      lctx.fillRect(0, 0, W, H);
      lctx.globalAlpha = 1;

      const speed = C.speed / 30;
      const flowScale = C.flow / 100;
      const turb = C.turb / 50;
      const swirl = C.swirl / 60;
      const t = now * 0.00015 * (1 + C.speed/150);

      // Smooth mouse
      if (mouse.inside) {
        if (mouse.x < -1000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
        mouse.px = mouse.x; mouse.py = mouse.y;
        mouse.x += (mouse.tx - mouse.x) * 0.18;
        mouse.y += (mouse.ty - mouse.y) * 0.18;
        mouse.vx = mouse.x - mouse.px;
        mouse.vy = mouse.y - mouse.py;
      } else {
        mouse.vx *= 0.9; mouse.vy *= 0.9;
      }

      const mOn = C.mMode !== "off" && mouse.inside;
      const mRadius = C.mRadius / Math.max(1, C.pixel);
      const mStr = C.mStr / 50;

      for (const r of ribbons) {
        let flowOX = 0, flowOY = 0;
        if (C.mParallax && mOn) {
          flowOX = (mouse.x / W - 0.5) * 0.6;
          flowOY = (mouse.y / H - 0.5) * 0.6;
        }
        const nx = r.x / (W / flowScale) * 0.8;
        const ny = r.y / (H / flowScale) * 0.8;
        const n = noise2(nx + t + flowOX, ny - t * 0.6 + flowOY);
        const ang = Math.atan2(r.y - H/2, r.x - W/2) + Math.PI/2;
        const angle = n * Math.PI * 2 * (1 + turb);
        let vx = Math.cos(angle) + Math.cos(ang) * swirl * 0.3;
        let vy = Math.sin(angle) + Math.sin(ang) * swirl * 0.3;

        if (mOn) {
          const mdx = r.x - mouse.x, mdy = r.y - mouse.y;
          const dist = Math.sqrt(mdx*mdx + mdy*mdy) + 0.0001;
          if (dist < mRadius) {
            const f = (1 - dist/mRadius) ** 2 * mStr;
            if (C.mMode === "attract") {
              vx -= (mdx/dist)*f; vy -= (mdy/dist)*f;
            } else if (C.mMode === "repel") {
              vx += (mdx/dist)*f*1.2; vy += (mdy/dist)*f*1.2;
            } else if (C.mMode === "orbit") {
              vx += (-mdy/dist)*f*1.4; vy += (mdx/dist)*f*1.4;
              vx -= (mdx/dist)*f*0.25; vy -= (mdy/dist)*f*0.25;
            } else if (C.mMode === "flow") {
              vx += mouse.vx*f*0.6; vy += mouse.vy*f*0.6;
            }
          }
        }

        const nextX = r.x + vx * speed * dt * 60;
        const nextY = r.y + vy * speed * dt * 60;
        const [cr,cg,cb] = adjustColor(hexToRgb(pal[r.colorIdx]));
        const radius = Math.max(0.5, r.w / (C.pixel < 3 ? 4 : 6));

        lctx.beginPath();
        lctx.fillStyle = `rgb(${cr},${cg},${cb})`;
        lctx.arc(r.x, r.y, radius, 0, Math.PI*2);
        lctx.fill();
        lctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
        lctx.lineWidth = radius * 2;
        lctx.lineCap = "round";
        lctx.beginPath();
        lctx.moveTo(r.x, r.y);
        lctx.lineTo(nextX, nextY);
        lctx.stroke();

        r.x = nextX; r.y = nextY; r.life--;
        if (r.x < -20 || r.x > W+20 || r.y < -20 || r.y > H+20 || r.life <= 0) {
          const side = Math.floor(Math.random()*4);
          if      (side===0){ r.x=Math.random()*W; r.y=-5; }
          else if (side===1){ r.x=W+5; r.y=Math.random()*H; }
          else if (side===2){ r.x=Math.random()*W; r.y=H+5; }
          else              { r.x=-5; r.y=Math.random()*H; }
          r.life = r.maxLife = C.length * (0.6 + Math.random()*0.8);
          r.w = C.width * (0.6 + Math.random()*0.8);
        }
      }

      // Cursor trail
      if (C.mTrail && mouse.inside && mouse.x > -1000) {
        mouse.trail.push({ x: mouse.x, y: mouse.y, life: 1 });
        if (mouse.trail.length > 40) mouse.trail.shift();
        for (let i = 0; i < mouse.trail.length; i++) {
          const p = mouse.trail[i];
          p.life -= 0.035;
          if (p.life <= 0) continue;
          const [cr,cg,cb] = adjustColor(hexToRgb(pal[i % pal.length]));
          const rad = Math.max(0.8, (C.width / Math.max(1, C.pixel)) * p.life * 0.9);
          lctx.beginPath();
          lctx.fillStyle = `rgba(${cr},${cg},${cb},${p.life})`;
          lctx.arc(p.x, p.y, rad, 0, Math.PI*2);
          lctx.fill();
        }
        mouse.trail = mouse.trail.filter(p => p.life > 0);
      }

      // Post-process (quantize / dither / invert)
      if (C.quant > 1 || C.invert || C.dither) {
        const img = lctx.getImageData(0, 0, W, H);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          let rr=d[i], gg=d[i+1], bb=d[i+2];
          if (C.quant > 1) {
            if (C.dither) {
              const bayer = (((i/4)%W & 3)*4 + (Math.floor((i/4)/W) & 3)) / 16;
              const off = (bayer - 0.5) * (255/(C.quant-1));
              rr=Math.min(255,rr+off); gg=Math.min(255,gg+off); bb=Math.min(255,bb+off);
            }
            rr=qChan(rr,C.quant); gg=qChan(gg,C.quant); bb=qChan(bb,C.quant);
          }
          if (C.invert){ rr=255-rr; gg=255-gg; bb=255-bb; }
          d[i]=rr; d[i+1]=gg; d[i+2]=bb;
        }
        lctx.putImageData(img, 0, 0);
      }

      // Upscale to main canvas (nearest-neighbor = pixelated look)
      ctx.imageSmoothingEnabled = false;
      if (C.rgbsplit) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = C.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "lighter";
        const off = Math.max(1, Math.floor(canvas.width * 0.003));
        ctx.globalAlpha = 0.9;
        ctx.drawImage(low, -off, 0, canvas.width, canvas.height);
        ctx.drawImage(low,  off, 0, canvas.width, canvas.height);
        ctx.drawImage(low,  0,   0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.drawImage(low, 0, 0, canvas.width, canvas.height);
      }

      // Scanlines overlay
      if (C.scanlines) {
        ctx.globalCompositeOperation = "multiply";
        const scanStep = Math.max(2, C.pixel * 2);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (let y = 0; y < canvas.height; y += scanStep) {
          ctx.fillRect(0, y, canvas.width, Math.floor(scanStep/2));
        }
        ctx.globalCompositeOperation = "source-over";
      }

      rafId = requestAnimationFrame(step);
    }

    const onMove  = (e: PointerEvent) => { const p = toLow(e.clientX, e.clientY); mouse.tx=p.x; mouse.ty=p.y; mouse.inside=true; };
    const onLeave = () => { mouse.inside = false; };

    // Pause rAF when hero scrolled off-screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(step);
      } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    }, { threshold: 0 });
    if (sectionRef.current) io.observe(sectionRef.current);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#0b0b0d" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />

      {/* ── Top meta ── */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-between items-center font-mono text-[11px] uppercase tracking-[0.08em] z-10 text-white"
        style={{ padding: "18px 22px", mixBlendMode: "difference" }}
      >
        <div className="flex items-center gap-[6px]">
          <span
            className="inline-block w-[7px] h-[7px] rounded-full bg-[#ff3b3b] animate-pulse"
            style={{ boxShadow: "0 0 0 2px rgba(255,59,59,.2)" }}
          />
          LIVE <span className="opacity-70 ml-1">{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="mailto:hello@justin.hearn.me"
            className="underline underline-offset-[3px] decoration-[1px] hover:opacity-70"
          >
            HELLO@JUSTIN.HEARN.ME
          </a>
          <span className="opacity-40">·</span>
          <a
            href="https://linkedin.com/in/jhearn/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-[3px] decoration-[1px] hover:opacity-70"
          >
            LINKEDIN
          </a>
        </div>
      </div>

      {/* ── Wordmark ── */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none select-none"
        aria-hidden="true"
      >
        <div
          className="flex items-center justify-center w-full font-display font-black uppercase text-white"
          style={{
            padding: "0 3vw",
            fontSize: "clamp(64px, 19.5vw, 340px)",
            letterSpacing: "-0.055em",
            lineHeight: 0.85,
            whiteSpace: "nowrap",
          }}
        >
          <span className="flex-1 text-right pr-[0.06em]">JUSTIN</span>

          {/* Character between the two words */}
          <span
            className="relative flex-none overflow-visible"
            style={{
              width:  "clamp(120px, 13vw, 240px)",
              height: "clamp(140px, 15vw, 280px)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/character.png"
              alt=""
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-auto pointer-events-none"
              style={{
                height: "115%",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.35))",
              }}
            />
          </span>

          <span className="flex-1 text-left pl-[0.06em]">HEARN</span>
        </div>
      </div>

      {/* ── Speech bubble ── */}
      <div
        className="absolute left-1/2 z-[6] font-mono font-bold uppercase text-black bg-white whitespace-nowrap pointer-events-none"
        style={{
          top: "calc(50% - clamp(150px, 16vw, 300px))",
          transform: "translate(-50%, -100%)",
          fontSize: "clamp(12px, 1vw, 18px)",
          letterSpacing: "0.05em",
          padding: "10px 16px",
        }}
      >
        LET&apos;S BUILD!
        {/* Stepped pixel tail */}
        <span
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -8, width: 14, height: 8,
            background: `
              linear-gradient(white,white) no-repeat 0 0/14px 4px,
              linear-gradient(white,white) no-repeat 2px 4px/10px 4px
            `,
          }}
        />
      </div>

      {/* ── Bottom meta ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-between items-end font-mono text-[11px] uppercase tracking-[0.08em] z-10 text-white"
        style={{ padding: "18px 22px", mixBlendMode: "difference" }}
      >
        <div className="flex flex-col gap-[4px]">
          <span>AI-AUGMENTED ENGINEERING</span>
          <span className="opacity-60">BASED IN SOUTHEAST MICHIGAN</span>
        </div>
        <div
          className="absolute left-1/2 bottom-[22px] -translate-x-1/2 font-mono text-[12px] text-white"
          style={{
            mixBlendMode: "difference",
            animation: "bounce 1.8s ease-in-out infinite",
          }}
        >
          ▼ SCROLL
        </div>
        <div className="flex flex-col gap-[4px] text-right">
          <span>SYSTEMS · AI INTEGRATION</span>
          <span className="opacity-60">FULL-STACK · INFRASTRUCTURE</span>
        </div>
      </div>
    </section>
  );
}
