"use client";

import { useEffect, useState } from "react";
import { Pyramind, Section } from "@/components/Pyramind";
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
    const [_sectionIndex, setSectionIndex] = useState<number|null>(null);

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
                        <a href={config.link} target="_parent" rel="noopener noreferrer">
                            <Image 
                                src="/finder-icon-blue.png" alt="finder" 
                                width={36} height={36}
                                className="_mix-blend-difference w-10 aspect-auto" 
                            />
                        </a>
                    </div>
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
