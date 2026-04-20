"use client";

import { useEffect, useRef, useState } from "react";

type CursorState = "eyes" | "eyes-alt" | "native";

function EyesSVG({ pressed }: { pressed: boolean }) {
  // Pupils shift down slightly on press
  const py = pressed ? 17 : 15;
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left eye socket */}
      <rect x="1" y="2" width="14" height="18" rx="7" fill="black"/>
      {/* Right eye socket */}
      <rect x="21" y="2" width="14" height="18" rx="7" fill="black"/>
      {/* Left white */}
      <circle cx="8" cy="12" r="5" fill="white"/>
      {/* Right white */}
      <circle cx="28" cy="12" r="5" fill="white"/>
      {/* Left pupil */}
      <circle cx="9" cy={py - 1} r="2.5" fill="black"/>
      {/* Right pupil */}
      <circle cx="29" cy={py - 1} r="2.5" fill="black"/>
    </svg>
  );
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("eyes");
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let lastX = -200;
    let lastY = -200;

    function getDataCursor(x: number, y: number): CursorState {
      const target = document.elementFromPoint(x, y)?.closest("[data-cursor]");
      return (target?.getAttribute("data-cursor") as CursorState) ?? "eyes";
    }

    function onMove(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
      el!.style.transform = `translate(${lastX}px, ${lastY}px)`;
      setState(getDataCursor(lastX, lastY));
    }

    function onDown() {
      setPressed(true);
    }

    function onUp() {
      setPressed(false);
      setState(getDataCursor(lastX, lastY));
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (state === "native") return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
      style={{ willChange: "transform" }}
    >
      <EyesSVG pressed={pressed} />
    </div>
  );
}
