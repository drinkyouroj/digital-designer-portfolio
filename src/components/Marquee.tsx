"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "Available for Work",
  "Based in NYC",
  "Est. 2019",
  "Digital Product Designer",
  "Let's Build Something",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div
      className="overflow-hidden border-y py-5"
      style={{ borderColor: "#1E1E1E", backgroundColor: "#0A0A0A" }}
    >
      <motion.div
        className="flex gap-12 whitespace-nowrap font-display font-bold uppercase text-white"
        style={{ fontSize: "clamp(2rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {row.map((label, i) => (
          <span key={i} className="flex items-center gap-12">
            {label}
            <span style={{ color: "#FF2F00" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
