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

vec3 vermillion = vec3(1.0, 0.184, 0.0);
vec3 cream      = vec3(0.933, 0.933, 0.933);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.0+vec2(1.7,9.2);a*=0.5;}
  return v;
}

void main() {
  vec2 uv = vUv * 2.5 + uTime * 0.04;
  float n = fbm(uv + fbm(uv + fbm(uv)));
  vec3 col = mix(cream, vermillion, smoothstep(0.3, 0.75, n));
  gl_FragColor = vec4(col, 1.0);
}`;

export default function FooterGL() {
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
      uniforms: { uTime: { value: 0 } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    function resize() { renderer.setSize(window.innerWidth, window.innerHeight); }
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
        running = false; cancelAnimationFrame(rafId);
      } else {
        running = true; rafId = requestAnimationFrame(loop);
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ["class"] });

    return () => {
      running = false; cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-gl="footer"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.64 }}
    />
  );
}
