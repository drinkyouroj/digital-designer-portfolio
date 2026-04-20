"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uRes;
uniform vec2  uMouse; // 0..1 normalized

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p  = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

#define PI 3.14159265359

void main() {
  // Pixel grid
  float pixel = 2.0;
  vec2 px = floor(gl_FragCoord.xy / pixel);

  // Normalized screen position (aspect-corrected)
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 uvA = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 mouseA = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);

  // Mouse push: ribbons flow AWAY from cursor, strength falls off with distance
  vec2  toMouse = uvA - mouseA;
  float dMouse  = length(toMouse);
  vec2  mouseWarp = normalize(toMouse + 1e-4) * exp(-dMouse * 2.8) * 0.35;

  float t = uTime * 0.05;
  vec2 cell = px / 90.0 + mouseWarp;

  // Two-step domain warp for S-curves
  vec2 q = vec2(
    fbm(cell + vec2(0.0, 0.0) + t * vec2(1.0, 0.5)),
    fbm(cell + vec2(5.2, 1.3) + t * vec2(-0.7, 1.1))
  );
  vec2 r = vec2(
    fbm(cell + 3.5 * q + vec2(1.7, 9.2) + t),
    fbm(cell + 3.5 * q + vec2(8.3, 2.8) - t)
  );
  float f = fbm(cell + 3.0 * r);

  // Sine level sets → ribbons
  float ribbons = sin(f * PI * 6.0 + t * 2.0);
  float band    = smoothstep(0.00, 0.50, ribbons);

  // Mouse halo: brighter near cursor
  float halo = exp(-dMouse * 3.0) * 0.55;

  // Radial fade (outer edges quieter) — inverted by halo near cursor
  float rad = length(uvA);
  float density = clamp(band - rad * 0.22 + halo, 0.0, 1.0);

  // Stipple
  float stipple = hash(px + floor(t * 30.0) * 0.001);
  float lit = step(stipple, density * density);

  // ── COLOR ────────────────────────────────────────────────────────────
  // Base palette: vermillion → blush → cyan, swept by the warp field
  vec3 vermillion = vec3(1.00, 0.18, 0.00);
  vec3 blush      = vec3(0.95, 0.74, 0.74);
  vec3 cyan       = vec3(0.35, 0.85, 1.00);
  vec3 white      = vec3(1.00, 1.00, 1.00);

  // Drift hue across the field so ribbons have colored zones
  float hue = fract(f + t * 0.4 + length(q) * 0.2);
  vec3 ribbonColor = mix(vermillion, cyan, smoothstep(0.2, 0.8, hue));
  ribbonColor      = mix(ribbonColor, white, smoothstep(0.8, 1.0, hue));

  // Extra pop near the mouse (warmer, punchier)
  ribbonColor = mix(ribbonColor, vermillion, clamp(halo * 1.6, 0.0, 0.75));

  // Dot color + faint background glow (very low) so black isn't pure crushed
  vec3 bgGlow = mix(vec3(0.0), blush * 0.035, smoothstep(0.0, 1.0, band));
  bgGlow     += vermillion * halo * 0.08;

  vec3 col = ribbonColor * lit + bgGlow;

  // Soft gamma lift so mids bloom slightly
  col = pow(col, vec3(0.92));

  gl_FragColor = vec4(col, 1.0);
}`;

export default function HeroGL() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: false, antialias: false });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";

    // Mouse tracked with damping — raw position flickers too sharply
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime:  { value: 0 },
        uRes:   { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr];
    }
    function onMouse(e: MouseEvent) {
      mouse.tx = e.clientX / window.innerWidth;
      // GL y is bottom-up
      mouse.ty = 1 - e.clientY / window.innerHeight;
    }
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    resize();

    let rafId: number;
    let running = true;
    function loop(t: number) {
      if (!running) return;
      rafId = requestAnimationFrame(loop);
      // Exponential smoothing for buttery tracking
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      program.uniforms.uMouse.value = [mouse.x, mouse.y];
      program.uniforms.uTime.value  = t * 0.001;
      renderer.render({ scene: mesh });
    }
    rafId = requestAnimationFrame(loop);

    const observer = new MutationObserver(() => {
      if (container.classList.contains("offscreen")) {
        running = false; cancelAnimationFrame(rafId);
      } else {
        running = true; rafId = requestAnimationFrame(loop);
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ["class"] });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      observer.disconnect();
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-gl="hero"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
