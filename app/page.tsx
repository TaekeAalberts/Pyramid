"use client";

import { Pyramind } from "@/components/Pyramind";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    title: "Finanzen",
    color: "text-sky-300",
    description: "Track revenue, expenses, and profitability metrics."
  },
  {
    title: "Produkt",
    color: "text-emerald-300",
    description: "Monitor product performance, features, and quality."
  },
  {
    title: "Interne Prozesse",
    color: "text-amber-300",
    description: "Evaluate operational efficiency and workflow health."
  },
  {
    title: "Ressourcen",
    color: "text-pink-300",
    description: "Manage team capacity, tools, and infrastructure."
  }
];

export default function Home() {
    const [section, setSection]   = useState<number>(-1); // -1 = idle

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#181818]">
            {/* 3‑D scene */}
            <div className="w-full h-full">
                <Pyramind onSectionChange={setSection} />
            </div>

            <AnimatePresence>
                {section !== -1 && (
                    <motion.div
                        key={`headline-${section}`}
                        className="pointer-events-none absolute bottom-10 left-0 right-0 flex flex-col items-start justify-end p-20 z-20"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    >
                        <h1 className={`font-geist-mono font-extrabold text-7xl`} >
                            {SECTIONS[section].title}
                        </h1>
                        <p className="mt-4 max-w-lg text-lg text-neutral-300">
                            {SECTIONS[section].description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
