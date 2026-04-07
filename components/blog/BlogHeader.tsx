'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Save, Send } from 'lucide-react';

type BlogHeaderProps = {
    title: string;
    description: string;
    onPreview: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
}

const BlogHeader = ({ title, description, onPreview, onSaveDraft, onPublish, }: BlogHeaderProps) => {
    const [isCondensed, setIsCondensed] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [placeholderHeight, setPlaceholderHeight] = useState(0);
    const [floatingStyle, setFloatingStyle] = useState<React.CSSProperties>({});
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const scrollParentRef = useRef<HTMLElement | Window | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const isHTMLElement = (
            value: HTMLElement | Window | null,
        ): value is HTMLElement => value instanceof HTMLElement;

        const getScrollParent = (element: HTMLElement | null) => {
            let current = element?.parentElement || null;

            while (current) {
                const { overflowY, overflow } = window.getComputedStyle(current);

                if (/(auto|scroll|overlay)/.test(`${overflowY} ${overflow}`)) {
                    return current;
                }

                current = current.parentElement;
            }

            return window;
        };

        const getScrollOffset = () => {
            if (isHTMLElement(scrollParentRef.current)) {
                return scrollParentRef.current.scrollTop;
            }

            return window.scrollY;
        };

        const updateHeaderPosition = () => {
            if (!wrapperRef.current || !cardRef.current) return;

            const stickyTop = window.innerWidth >= 1024 ? 16 : 12;
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const shouldStick = wrapperRect.top <= stickyTop;
            const scrollOffset = getScrollOffset();

            setIsSticky(shouldStick);
            setIsCondensed(scrollOffset > 36 || shouldStick);

            if (shouldStick) {
                setFloatingStyle({
                    top: stickyTop,
                    left: wrapperRect.left,
                    width: wrapperRect.width,
                });
                setPlaceholderHeight(cardRef.current.getBoundingClientRect().height);
            } else {
                setFloatingStyle({});
                setPlaceholderHeight(0);
            }
        };

        const requestHeaderUpdate = () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = window.requestAnimationFrame(() => {
                updateHeaderPosition();
            });
        };

        scrollParentRef.current = getScrollParent(wrapperRef.current);
        updateHeaderPosition();

        if (scrollParentRef.current && scrollParentRef.current !== window) {
            scrollParentRef.current.addEventListener('scroll', requestHeaderUpdate, { passive: true });
        }

        window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
        window.addEventListener('resize', requestHeaderUpdate);

        const resizeObserver = new ResizeObserver(() => {
            requestHeaderUpdate();
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        if (cardRef.current) {
            resizeObserver.observe(cardRef.current);
        }

        return () => {
            if (scrollParentRef.current && scrollParentRef.current !== window) {
                scrollParentRef.current.removeEventListener('scroll', requestHeaderUpdate);
            }

            window.removeEventListener('scroll', requestHeaderUpdate);
            window.removeEventListener('resize', requestHeaderUpdate);

            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }

            resizeObserver.disconnect();
        };
    }, []);

    const secondaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101826] text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e] hover:bg-[#182438] ${
        isCondensed ? 'px-4 py-2.5' : 'px-5 py-3'
    }`;

    const primaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef4ff] text-sm font-semibold text-[#0f1724] transition hover:bg-white ${
        isCondensed ? 'px-4 py-2.5' : 'px-5 py-3'
    }`;

    return (
        <div
            ref={wrapperRef}
            style={isSticky ? { height: placeholderHeight } : undefined}
        >
            <div
                ref={cardRef}
                style={isSticky ? floatingStyle : undefined}
                className={`rounded-[24px] border border-white/8 bg-[#151d2c]/95 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 ${
                    isSticky ? 'fixed z-40' : 'relative'
                } ${isCondensed ? 'p-4' : 'p-6'}`}
            >
                <div className={`flex flex-col gap-4 transition-all duration-300 xl:flex-row xl:items-center xl:justify-between ${isCondensed ? 'xl:gap-6' : 'xl:gap-8'}`}>
                    <div className="min-w-0">
                        <span
                            className={`inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8] transition-all duration-300 ${
                                isCondensed ? 'pointer-events-none absolute opacity-0' : 'opacity-100'
                            }`}
                        >
                            Editorial Workspace
                        </span>
                        <h1
                            className={`font-semibold tracking-[-0.04em] text-[#eef4ff] transition-all duration-300 ${
                                isCondensed ? 'text-[24px] leading-none' : 'mt-4 text-[36px] leading-none'
                            }`}
                        >
                            {title}
                        </h1>
                        <p
                            className={`max-w-2xl text-sm leading-7 text-[#8ea0b8] transition-all duration-300 ${
                                isCondensed ? 'mt-0 max-h-0 overflow-hidden opacity-0' : 'mt-3 opacity-100'
                            }`}
                        >
                            {description}
                        </p>
                    </div>

                    <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:shrink-0">
                        <button
                            type="button"
                            onClick={onPreview}
                            className={secondaryButtonClassName}
                        >
                            <Eye size={17} />
                            Preview
                        </button>
                        <button
                            type="button"
                            className={secondaryButtonClassName}
                            onClick={onSaveDraft}
                        >
                            <Save size={17} />
                            Save Draft
                        </button>
                        <button
                            type="button"
                            className={primaryButtonClassName}
                            onClick={onPublish}
                        >
                            <Send size={17} />
                            Publish All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogHeader;
