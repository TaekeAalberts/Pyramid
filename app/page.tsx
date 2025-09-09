"use client";

import { Pyramind } from "@/components/Pyramind";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const SECTIONS = [
        {
            "name": "Finanzen",
            "desc": "Umsatz, Kosten und Profitabilität überwachen",
            "icon": "/euro.png",
            "link": "https://fmis.aalberts-kara.de/fdd/finanzen/"
        },
        {
            "name": "Produkt",
            "desc": "Produktleistung, Funktionen und Qualität überwachen",
            "icon": "/package.png",
            "link": "https://fmis.aalberts-kara.de/fdd/produkt/"
        },
        {
            "name": "Interne Prozesse",
            "desc": "Leistungsfähigkeit und Stabilität der Arbeitsabläufe beurteilen",
            "icon": "/gear.png",
            "link": "https://fmis.aalberts-kara.de/fdd/interne-prozesse/"
        },
        {
            "name": "Ressourcen",
            "desc": "Teamkapazitäten, Tools und Infrastruktur verwalten",
            "icon": "/group.png",
            "link": "https://fmis.aalberts-kara.de/fdd/ressourcen/"
        }
];

export default function Home() {
    const [section, setSection]   = useState<number|null>(null); // -1 = idle

    return (
        <div className="relative w-full h-dvh overflow-hidden bg-[#181818]">

            <Pyramind sections={SECTIONS} onSectionChange={setSection} />

            <div className="absolute top-4 left-4 md:top-10 md:left-10 flex flex-col z-50 font-normal text-base/4 md:text-3xl/7 text-shadow-xs text-[#002B5B]">
                <div><span className="font-black">F</span>arm</div>
                <div><span className="font-black">M</span>anagement</div>
                <div><span className="font-black">I</span>nformation</div>
                <div><span className="font-black">S</span>ystem</div>
            </div>

            <div 
                className="absolute top-4 right-4 md:top-10 md:right-10 text-xl md:text-4xl font-bold text-shadow-sm text-[#002B5B] flex flex-col gap-2 items-end">Friedland Dairy
                <a href="https://aalbertskarade.sharepoint.com/sites/FriedlandDairy">
                    <Image src="/finder.gif" width={48} height={48} alt="finder" className="mix-blend-multiply" />
                </a>
            </div>

            <AnimatePresence>
                {section !== null && (
                    <motion.div
                        key={`headline-${section}`}
                        className="pointer-events-none absolute bottom-4 md:bottom-10 left-0 right-0 flex flex-col items-start justify-end p-4 pb-0 md:p-20 md:pb-10 z-20 text-shadow-lg"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    >
                        <h1 className={`text-white font-geist font-extrabold text-3xl/5 md:text-7xl text-shadow-lg`} >
                            {SECTIONS[section].name}
                        </h1>
                        <p className="mt-4 max-w-lg text-sm md:text-lg text-white text-shadow-lg">
                            {SECTIONS[section].desc}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
