export default function SpeechBubble({ children }: { children: React.ReactNode }) {
  // Pixel-art stepped corners: nest 3 layered boxes with decreasing inset + black borders
  return (
    <div className="relative inline-block" aria-hidden={false}>
      {/* Tier 1 — widest, 2px tall top/bottom strip */}
      <div
        className="font-display font-bold uppercase text-black"
        style={{
          backgroundColor: "#FFFFFF",
          border: "3px solid #000000",
          padding: "0 18px",
          fontSize: "clamp(1rem, 2.4vw, 1.75rem)",
          letterSpacing: "-0.01em",
          boxShadow: `
            0 -6px 0 0 #FFFFFF,
            0 6px 0 0 #FFFFFF,
            -6px 0 0 0 #FFFFFF,
            6px 0 0 0 #FFFFFF,
            0 -9px 0 0 #000000,
            0 9px 0 0 #000000,
            -9px 0 0 0 #000000,
            9px 0 0 0 #000000
          `,
          lineHeight: "2.2",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Tail — stepped pixel triangle pointing down */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "-22px", zIndex: 2 }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" shapeRendering="crispEdges">
          {/* Outer black step */}
          <rect x="8"  y="0"  width="12" height="4" fill="#000000" />
          <rect x="10" y="4"  width="12" height="4" fill="#000000" />
          <rect x="12" y="8"  width="12" height="4" fill="#000000" />
          <rect x="14" y="12" width="10" height="4" fill="#000000" />
          <rect x="16" y="16" width="8"  height="4" fill="#000000" />
          {/* White inner fill */}
          <rect x="10" y="0"  width="8" height="4" fill="#FFFFFF" />
          <rect x="12" y="4"  width="8" height="4" fill="#FFFFFF" />
          <rect x="14" y="8"  width="8" height="4" fill="#FFFFFF" />
          <rect x="16" y="12" width="6" height="4" fill="#FFFFFF" />
          <rect x="18" y="16" width="4" height="4" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
}
