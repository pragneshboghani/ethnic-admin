'use client';

import { useEffect, useMemo, useState } from "react";
import { getStatusMeta } from "@/utils/blogHelpers";
import { Maximize2, Minimize2 } from "lucide-react";
import { PlatformPreviewItem, PlatformSpecificPreviewProps } from "@/types";
import { usePathname } from "next/navigation";

const PlatformSpecificPreview = ({ title, excerpt, selectedPlatforms, platformData, platformSettings, }: PlatformSpecificPreviewProps) => {

    const pathname = usePathname();
    const [viewMode, setViewMode] = useState<"preview" | "iframe">("preview");
    const [isIframeFullScreen, setIsIframeFullScreen] = useState(false);
    const previewPlatforms = useMemo((): PlatformPreviewItem[] => {
        const result: PlatformPreviewItem[] = [];

        selectedPlatforms.forEach((platformId) => {
            const platform = platformData?.data?.find((item) => item.id === platformId);

            if (!platform) return;

            result.push({
                id: platformId,
                platformName:
                    platform.platform_name || `Platform #${platformId}`,
                websiteUrl: platform.website_url || "",
                settings: platformSettings?.[platformId],
            });
        });

        return result;
    }, [platformData, platformSettings, selectedPlatforms]);

    const [selectedPreviewPlatformId, setSelectedPreviewPlatformId] = useState<number | null>(selectedPlatforms[0] ?? null,);

    const activePlatformPreview = previewPlatforms.find((platform) => platform.id === selectedPreviewPlatformId) || previewPlatforms[0];

    const seoTitle = activePlatformPreview?.settings?.seoTitle || title || "Untitled blog post";
    const metaDescription = activePlatformPreview?.settings?.metaDescription || excerpt || "No meta description provided.";
    const canonicalUrl = activePlatformPreview?.settings?.canonicalUrl || activePlatformPreview?.websiteUrl || "";
    const ctaButtonText = activePlatformPreview?.settings?.ctaButtonText || "Read more";
    const ctaButtonLink = activePlatformPreview?.settings?.ctaButtonLink || canonicalUrl || "#";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsIframeFullScreen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                            Platform Preview
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                            Preview by platform
                        </h3>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                            Switch platforms to inspect SEO title, snippet, URL, and CTA for each destination.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {previewPlatforms.map((platform) => (
                            <button
                                key={platform.id}
                                type="button"
                                onClick={() => setSelectedPreviewPlatformId(platform.id)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedPreviewPlatformId === platform.id
                                    ? "border-[#c1dde1] bg-[var(--bg-selected)] text-[var(--status-green-text)]"
                                    : "border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                                    }`}
                            >
                                {platform.platformName}
                            </button>
                        ))}
                    </div>
                </div>

                {pathname !== '/account/blogs/add' && (
                    <div className="flex flex-col gap-2 pb-4 my-4 sm:flex-row border-b border-[var(--border)]">
                        <button
                            onClick={() => setViewMode("preview")}
                            className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${viewMode === 'preview'
                                ? 'border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                                : 'text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]'
                                }`}
                        >
                            Snippet View
                        </button>

                        <button
                            onClick={() => setViewMode("iframe")}
                            className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${viewMode === 'iframe'
                                ? 'border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                                : 'text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]'
                                }`}
                        >
                            Live Page
                        </button>
                    </div>
                )}
                {activePlatformPreview ? (
                    viewMode === "preview" ? (
                        <div className="mt-5 grid gap-5 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-5">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Search Snippet Preview
                                </p>
                                <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                                    <h4 className="text-lg font-semibold text-[var(--accent)]">
                                        {seoTitle}
                                    </h4>
                                    <p className="mt-2 text-sm leading-6 text-[var(--text)]">
                                        {metaDescription}
                                    </p>
                                    <p className="mt-3 text-sm text-[var(--text)]">
                                        <b>Canonical URL: </b> &nbsp; {activePlatformPreview.settings?.canonicalUrl || "canonicalUrl unavailable"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-5">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Platform Delivery Preview
                                </p>
                                <div className="mt-4 space-y-4 rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-strong)]">
                                                {activePlatformPreview.platformName}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                {activePlatformPreview.websiteUrl || "Website URL unavailable"}
                                            </p>
                                        </div>
                                        <p className={`inline-flex rounded-full border h-fit px-2.5 py-1 text-xs font-medium ${getStatusMeta(activePlatformPreview.settings?.publishStatus || "draft").className}`}> {activePlatformPreview.settings?.publishStatus || "draft"}</p>
                                    </div>

                                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                            Slug
                                        </p>
                                        <p className="mt-2 text-sm text-[var(--text)] truncate-2">
                                            {activePlatformPreview.settings?.slug || "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                                        <div className="flex flex-wrap justify-between items-center gap-3">
                                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                                CTA Preview
                                            </p>
                                            <a href={ctaButtonLink} target="blank" className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#ffffff]">
                                                {ctaButtonText}
                                            </a>
                                        </div>
                                        <span className="mt-3 truncate-2 text-xs text-[var(--text-muted)]">
                                            {ctaButtonLink}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-5 transition-all ${isIframeFullScreen
                                ? "fixed inset-0 z-[999] m-0 rounded-none p-0 bg-black"
                                : ""
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Live Website Preview
                                </p>

                                <button
                                    onClick={() => setIsIframeFullScreen((prev) => !prev)}
                                    className="px-3 py-1 text-xs rounded-md bg-[var(--accent)] text-[#ffffff] font-semibold flex items-center gap-1"
                                >
                                    {isIframeFullScreen ? (
                                        <>
                                            <Minimize2 className="w-4 h-4" />
                                            Exit Full Screen
                                        </>
                                    ) : (
                                        <>
                                            <Maximize2 className="w-4 h-4" />
                                            Full Screen
                                        </>
                                    )}
                                </button>
                            </div>

                            {canonicalUrl ? (
                                <iframe
                                    src={canonicalUrl}
                                    className={`mt-4 w-full ${isIframeFullScreen ? "h-screen" : "h-[500px]"
                                        } rounded-[16px] border border-[var(--border)]`}
                                />
                            ) : (
                                <p className="mt-4 text-sm text-[var(--text-muted)]">
                                    No URL available for iframe preview
                                </p>
                            )}
                        </div>
                    ))
                    : (
                        <div className="mt-5 rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-10 text-center">
                            <p className="text-base font-medium text-[var(--text)]">
                                No platform selected for preview
                            </p>
                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                Select at least one platform in platform settings to see a destination-specific preview.
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default PlatformSpecificPreview;
