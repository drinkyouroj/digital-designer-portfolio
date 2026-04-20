export default function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-block">
      <div
        className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full"
        style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-6px",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid #FFFFFF",
        }}
      />
    </div>
  );
}
