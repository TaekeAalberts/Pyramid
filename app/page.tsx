"use client";

import { Pyramind } from "@/components/Pyramind";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    title: "Finanzen",
    color: "text-sky-300",
    description: "Umsatz, Kosten und Profitabilität überwachen"
  },
  {
    title: "Produkt",
    color: "text-emerald-300",
    description: "Produktleistung, Funktionen und Qualität überwachen"
  },
  {
    title: "Interne Prozesse",
    color: "text-amber-300",
    description: "Leistungsfähigkeit und Stabilität der Arbeitsabläufe beurteilen"
  },
  {
    title: "Ressourcen",
    color: "text-pink-300",
    description: "Teamkapazitäten, Tools und Infrastruktur verwalten"
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
            <div className="absolute top-10 left-10 flex z-50 font-bold text-xl/5 text-shadow-xs text-[#002B5B]">
                Farm<br/>
                Manangement<br/>
                Information<br/>
                System<br/>
            </div>
            <div className="absolute top-10 right-10 text-4xl font-bold text-shadow-sm text-[#002B5B]">Friedland Dairy</div>

            <AnimatePresence>
                {section !== -1 && (
                    <motion.div
                        key={`headline-${section}`}
                        className="pointer-events-none absolute bottom-10 left-0 right-0 flex flex-col items-start justify-end p-20 z-20 text-shadow-lg"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    >
                        <h1 className={`font-geist-mono font-extrabold text-7xl text-shadow-lg`} >
                            {SECTIONS[section].title}
                        </h1>
                        <p className="mt-4 max-w-lg text-lg text-white text-shadow-lg">
                            {SECTIONS[section].description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
