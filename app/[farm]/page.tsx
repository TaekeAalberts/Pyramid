"use client";

import { useEffect, useState } from "react";
import { Pyramind, Section } from "@/components/Pyramind";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface Config {
    name: string;
    link: string;
    sections: Section[];
}

export default function FarmPage({ params }: { params: Promise<{farm: string}> })
{
    const [config, setConfig] = useState<Config|null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [sectionIndex, setSectionIndex] = useState<number|null>(null);

    async function setup() {
        try {
            const { farm } = await params;
            const response = await fetch(`/farms/${farm}.json`);
            const config = await response.json() as Config;
            setConfig(config);
        } catch {
            setIsError(true);
        }
    };

    useEffect(() => {
        setup();
    }, [params]);

    return (
        <main>
            {config && !isError && <>
                <div className="relative w-full h-dvh overflow-hidden bg-[#181818]">

                    <Pyramind
                        sections={config.sections}
                        onSectionChange={setSectionIndex} 
                    />

                    <div className="absolute top-4 left-4 md:top-10 md:left-10 flex flex-col z-50 font-normal text-base/4 md:text-3xl/7 text-shadow-xs text-[#002B5B]">
                        <div><span className="font-black">F</span>arm</div>
                        <div><span className="font-black">M</span>anagement</div>
                        <div><span className="font-black">I</span>nformation</div>
                        <div><span className="font-black">S</span>ystem</div>
                    </div>

                    <div className="absolute top-4 right-4 md:top-10 md:right-10 text-xl md:text-4xl font-bold text-shadow-sm text-[#002B5B] flex flex-col gap-2 items-end">
                        {config.name}
                        <a href={config.link}>
                            <Image src="/finder.gif" width={48} height={48} alt="finder" className="mix-blend-multiply" />
                        </a>
                    </div>

                    <AnimatePresence>
                        {sectionIndex !== null && (
                            <motion.div
                                key={`headline-${sectionIndex}`}
                                className="pointer-events-none absolute bottom-4 md:bottom-10 left-0 right-0 flex flex-col items-start justify-end p-4 pb-0 md:p-20 md:pb-10 z-20 text-shadow-lg"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                            >
                                <h1 className={`text-white font-geist font-extrabold text-3xl/5 md:text-7xl text-shadow-lg`} >
                                    {config.sections[sectionIndex].name}
                                </h1>
                                <p className="mt-4 max-w-lg text-sm md:text-lg text-white text-shadow-lg">
                                    {config.sections[sectionIndex].desc}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </>
            }
            {
                isError && <ErrorPopup />
            }
        </main>
    );
}

function ErrorPopup()
{
    return (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-yellow-400 flex items-center justify-center text-8xl font-semibold text-center">
            Not Found
        </div>
    );
}
