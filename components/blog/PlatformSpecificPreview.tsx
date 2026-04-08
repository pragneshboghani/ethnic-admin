'use client';

import { useMemo, useState } from "react";
import { PlatformSetting, PlatformSettings } from "@/types";
import { PreviewPlatform } from "./BlogPreviewModal";
import { getStatusMeta } from "@/utils/blogHelpers";

type PlatformSpecificPreviewProps = {
    title: string;
    excerpt: string;
    selectedPlatforms: number[];
    platformData: {
        data?: PreviewPlatform[];
    } | null;
    platformSettings: PlatformSettings;
};

type PlatformPreviewItem = {
    id: number;
    platformName: string;
    websiteUrl: string;
    settings?: PlatformSetting;
};

const PlatformSpecificPreview = ({ title, excerpt, selectedPlatforms, platformData, platformSettings, }: PlatformSpecificPreviewProps) => {
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

    console.log('activePlatformPreview', activePlatformPreview)

    return (
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                <div className="flex flex-col gap-3 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]">
                            Platform Preview
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#eef4ff]">
                            Preview by platform
                        </h3>
                        <p className="mt-2 text-sm text-[#8ea0b8]">
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
                                    ? "border-[#3f7b83] bg-[#16333a] text-[#c2edf0]"
                                    : "border-white/10 bg-[#101826] text-[#dbe5f3] hover:border-[#31425e] hover:bg-[#182438]"
                                    }`}
                            >
                                {platform.platformName}
                            </button>
                        ))}
                    </div>
                </div>

                {activePlatformPreview ? (
                    <div className="mt-5 grid gap-5 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                        <div className="rounded-[22px] border border-white/8 bg-[#101826] p-5">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                Search Snippet Preview
                            </p>
                            <div className="mt-4 rounded-[18px] border border-white/8 bg-[#0f1724] p-5">
                                <h4 className="text-lg font-semibold text-[#9ad8de]">
                                    {seoTitle}
                                </h4>
                                <p className="mt-2 text-sm leading-6 text-[#dbe5f3]">
                                    {metaDescription}
                                </p>
                                <p className="mt-3 text-sm text-[#dbe5f3]">
                                    <b>Canonical URL: </b> &nbsp; {activePlatformPreview.settings?.canonicalUrl || "canonicalUrl unavailable"}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[22px] border border-white/8 bg-[#101826] p-5">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                Platform Delivery Preview
                            </p>
                            <div className="mt-4 space-y-4 rounded-[18px] border border-white/8 bg-[#0f1724] p-5">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#eef4ff]">
                                            {activePlatformPreview.platformName}
                                        </p>
                                        <p className="mt-1 text-xs text-[#8ea0b8]">
                                            {activePlatformPreview.websiteUrl || "Website URL unavailable"}
                                        </p>
                                    </div>
                                    <p className={`inline-flex rounded-full border h-fit px-2.5 py-1 text-xs font-medium ${getStatusMeta(activePlatformPreview.settings?.publishStatus || "draft").className}`}> {activePlatformPreview.settings?.publishStatus || "draft"}</p>
                                </div>

                                <div className="rounded-[16px] border border-white/8 bg-[#151d2c] p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-[#7f90a8]">
                                        Slug
                                    </p>
                                    <p className="mt-2 text-sm text-[#dbe5f3] truncate-2">
                                        {activePlatformPreview.settings?.slug || "-"}
                                    </p>
                                </div>

                                <div className="rounded-[16px] border border-white/8 bg-[#151d2c] p-4">
                                    <div className="flex flex-wrap justify-between items-center gap-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-[#7f90a8]">
                                            CTA Preview
                                        </p>
                                        <a href={ctaButtonLink} target="blank" className="inline-flex rounded-xl bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#0f1724]">
                                            {ctaButtonText}
                                        </a>
                                    </div>
                                    <span className="mt-3 truncate-2 text-xs text-[#8ea0b8]">
                                        {ctaButtonLink}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 rounded-[20px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 text-center">
                        <p className="text-base font-medium text-[#dbe5f3]">
                            No platform selected for preview
                        </p>
                        <p className="mt-2 text-sm text-[#8ea0b8]">
                            Select at least one platform in platform settings to see a destination-specific preview.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlatformSpecificPreview;
