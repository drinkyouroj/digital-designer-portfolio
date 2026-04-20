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

// Bayer-dithered FBM noise: chunky pixel-art pattern, black/white
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uRes;

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
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// 8x8 Bayer matrix threshold (normalized 0..1)
float bayer8(vec2 c) {
  int x = int(mod(c.x, 8.0));
  int y = int(mod(c.y, 8.0));
  int idx = x + y * 8;
  // Flattened Bayer-8 pattern
  float m[64];
  m[0]=0.0;  m[1]=32.0; m[2]=8.0;  m[3]=40.0; m[4]=2.0;  m[5]=34.0; m[6]=10.0; m[7]=42.0;
  m[8]=48.0; m[9]=16.0; m[10]=56.0;m[11]=24.0;m[12]=50.0;m[13]=18.0;m[14]=58.0;m[15]=26.0;
  m[16]=12.0;m[17]=44.0;m[18]=4.0; m[19]=36.0;m[20]=14.0;m[21]=46.0;m[22]=6.0; m[23]=38.0;
  m[24]=60.0;m[25]=28.0;m[26]=52.0;m[27]=20.0;m[28]=62.0;m[29]=30.0;m[30]=54.0;m[31]=22.0;
  m[32]=3.0; m[33]=35.0;m[34]=11.0;m[35]=43.0;m[36]=1.0; m[37]=33.0;m[38]=9.0; m[39]=41.0;
  m[40]=51.0;m[41]=19.0;m[42]=59.0;m[43]=27.0;m[44]=49.0;m[45]=17.0;m[46]=57.0;m[47]=25.0;
  m[48]=15.0;m[49]=47.0;m[50]=7.0; m[51]=39.0;m[52]=13.0;m[53]=45.0;m[54]=5.0; m[55]=37.0;
  m[56]=63.0;m[57]=31.0;m[58]=55.0;m[59]=23.0;m[60]=61.0;m[61]=29.0;m[62]=53.0;m[63]=21.0;
  return m[idx] / 64.0;
}

void main() {
  // Chunky pixel grid — snap to ~3px cells
  float pixel = 3.0;
  vec2 px = floor(gl_FragCoord.xy / pixel);

  // Sample slow-moving FBM noise at pixel resolution
  vec2 p = px / 80.0 + vec2(uTime * 0.03, uTime * 0.02);
  float n = fbm(p + fbm(p));

  // Radial vignette so center is brighter, edges fall to black
  vec2 uvc = (gl_FragCoord.xy / uRes) - 0.5;
  float r = length(uvc) * 1.4;
  float bright = clamp(n * 1.1 - r * 0.9 + 0.15, 0.0, 1.0);

  // Ordered-dither threshold against Bayer matrix
  float t = bayer8(px);
  float lit = step(t, bright);

  vec3 col = vec3(lit) * 0.92;
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

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes:  { value: [1, 1] },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr];
    }
    window.addEventListener("resize", resize);
    resize();

    let rafId: number;
    let running = true;

    function loop(t: number) {
      if (!running) return;
      rafId = requestAnimationFrame(loop);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    rafId = requestAnimationFrame(loop);

    const observer = new MutationObserver(() => {
      if (container.classList.contains("offscreen")) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ["class"] });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
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
      style={{ opacity: 0.55 }}
    />
  );
}
