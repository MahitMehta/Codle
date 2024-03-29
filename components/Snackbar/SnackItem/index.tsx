import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface ISnackItem {
    title: string; 
    permanent?: boolean; 
}

interface SnackItemProps extends ISnackItem {
    onDisappear: () => void; 
    disappear: boolean,
}

const SnackItem : React.FC<SnackItemProps> = ({ onDisappear, disappear, ...item }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return; 

        const tl = gsap.timeline({
            repeat: 0
        }).fromTo(containerRef.current, {
            opacity: 1,
        }, {
            opacity: 0, duration: 0.15,
            delay: 2,
        }).eventCallback("onComplete", () => {
            onDisappear();
        });

        return () => {
            tl.kill();
        }
    }, [ containerRef, onDisappear ]);

    return (
        <div ref={containerRef} className="w-min mx-auto bg-white px-3 py-4 rounded-md my-3">
            <h1 className="whitespace-nowrap font-semibold">{ item.title }</h1>
        </div>
    )
}

export default React.memo(SnackItem);