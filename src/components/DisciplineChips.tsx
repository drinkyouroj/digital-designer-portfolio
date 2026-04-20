"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { clsx } from "clsx";

const CHIPS = ["UX", "Web", "Motion", "Visual"] as const;
type Chip = (typeof CHIPS)[number];

export default function DisciplineChips() {
  const [active, setActive] = useState<Chip>("UX");

  return (
    <LayoutGroup>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const isActive = chip === active;
          return (
            <button
              key={chip}
              onClick={() => setActive(chip)}
              data-cursor="finger"
              data-clickable="true"
              className={clsx(
                "relative px-5 py-2 rounded-full text-sm font-sans font-600 uppercase tracking-wider transition-colors",
                isActive ? "text-panel" : "text-ink border border-ink"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="chip-bg"
                  className="absolute inset-0 rounded-full bg-vermillion"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {chip}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
