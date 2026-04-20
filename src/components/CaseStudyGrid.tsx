"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const PROJECTS = [
  { slug: "luuna",     title: "Luuna",     year: "2024", desc: "Sleep & wellness brand" },
  { slug: "twinby",    title: "Twinby",    year: "2023", desc: "Social discovery platform" },
  { slug: "adc-space", title: "ADC Space", year: "2023", desc: "Creative community hub" },
] as const;

export default function CaseStudyGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PROJECTS.map((p) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <Link
            href={`/case-studies/${p.slug}`}
            data-cursor="finger"
            data-clickable="true"
            className="group relative block overflow-hidden rounded-xl bg-panel aspect-[4/3]"
          >
            {/* Placeholder cover — replace with next/image once assets exist */}
            <div className="absolute inset-0 bg-line flex items-end p-5">
              <div>
                <p className="font-mono text-xs text-mute uppercase tracking-widest mb-1">
                  {p.year}
                </p>
                <h3 className="font-display font-600 text-xl text-ink">{p.title}</h3>
                <p className="font-sans text-sm text-mute mt-1">{p.desc}</p>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-vermillion/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Coin GIF accent — hidden until asset added to /public/coin.gif */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/coin.gif"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
