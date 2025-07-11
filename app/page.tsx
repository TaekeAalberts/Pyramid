"use client";

import { Pyramind } from "@/components/Pyramind";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { title: "Teamwork",  color: "text-sky-300",
    links: [
      { label: "About the team", href: "#team" },
      { label: "Open positions", href: "#jobs" },
    ] },
  { title: "Logistics", color: "text-emerald-300",
    links: [
      { label: "Our process", href: "#process" },
      { label: "Warehouse tour", href: "#tour" },
    ] },
  { title: "Settings",  color: "text-amber-300",
    links: [
      { label: "Account", href: "#account" },
      { label: "Preferences", href: "#prefs" },
    ] },
  { title: "Finance",   color: "text-pink-300",
    links: [
      { label: "Pricing", href: "#pricing" },
      { label: "Investors", href: "#investors" },
    ] },
];

export default function Home() {
  const [section, setSection]   = useState<number>(-1); // -1 = idle
  const [visible, setVisible]   = useState(false);      // controls list life‑cycle
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  /* keep panel for 2 s after exit */
  useEffect(() => {
    if (section !== -1) {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      hideTimer.current = setTimeout(() => setVisible(false), 2000);
    }
  }, [section]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#181818]">
      {/* 3‑D scene */}
      <div className="w-full h-full">
        <Pyramind onSectionChange={setSection} />
      </div>

      {/* Headline overlay (unchanged) */}
      <AnimatePresence>
        {section !== -1 && (
          <motion.div
            key={`headline-${section}`}
            className="pointer-events-none absolute inset-0 flex flex-col items-start justify-center p-20 z-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <h1
              className={`font-sans font-extrabold text-7xl ${SECTIONS[section].color}`}
            >
              {SECTIONS[section].title}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              lacinia odio vitae vestibulum vestibulum.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Quick‑links panel ---------- */}
      <AnimatePresence>
        {visible && section !== -1 && (
          <motion.aside
            key={`links-${section}`}
            className="pointer-events-auto absolute top-0 right-0 z-30 flex h-full w-60 flex-col gap-4 bg-white/5 backdrop-blur-md p-8"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <h2 className="mb-2 text-xl font-semibold text-white/80 tracking-wide">
              {SECTIONS[section].title}
            </h2>
            <nav className="flex flex-col gap-3 text-base">
              {SECTIONS[section].links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-slate-100 hover:text-white"
                >
                  {/* chevron icon */}
                  <svg
                    className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{l.label}</span>
                </a>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
