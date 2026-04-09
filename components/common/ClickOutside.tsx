"use client";

import { useEffect, useRef } from "react";

interface ClickOutsideProps {
    children: React.ReactNode;
    onClickOutside: () => void;
}

const ClickOutside = ({ children, onClickOutside }: ClickOutsideProps) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside();
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [onClickOutside]);

    return <div ref={ref}>{children}</div>;
};

export default ClickOutside;