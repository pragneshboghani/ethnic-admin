'use client';

import { BlogPreviewModalProps } from "@/types";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import ClickOutside from "../common/ClickOutside";
import PublishStatusTracking from "./PublishStatusTracking";
import { useSearchParams } from "next/navigation";
import GeneralTabContent from "./GeneralTabContent";
import PlatformSpecificPreview from "./PlatformSpecificPreview";

export type PreviewPlatform = {
    id: number;
    platform_name?: string;
    website_url?: string;
};

const BlogPreviewModal = ({ showPreview, setShowPreview, mode = "preview", onConfirmPublish, image, category, categories, publishDate, globalStatus = "draft", updateDate, createDate, readingTime, title, excerpt, formContent, tags, relatedBlogs, allBlogs, selectedPlatforms, platformData, platformSettings, faq, publishHistory = [], publishHistoryLoading = false, }: BlogPreviewModalProps) => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [activeTab, setActiveTab] = useState<"general" | "status_tracking" | "platforms">("general");
    const categoryNames = category
        .map((id) => categories.find((item) => item.id === id)?.name)
        .filter((name): name is string => Boolean(name));

    const currentBlogStatus = useMemo(
        () =>
            selectedPlatforms.map((platformId) => {
                const platform = platformData?.data?.find(
                    (item: PreviewPlatform) => item.id === platformId,
                );
                const settings = platformSettings?.[platformId];

                return {
                    platformId,
                    platformName: platform?.platform_name || `Platform #${platformId}`,
                    publishStatus: settings?.publishStatus || "draft",
                    slug: settings?.slug || "-",
                };
            }),
        [platformData, platformSettings, selectedPlatforms],
    );

    if (!showPreview) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
            <ClickOutside onClickOutside={() => setShowPreview(false)}>
                <div className="max-h-[90vh] w-[1000px] max-w-[90vw] overflow-y-auto rounded-[28px] border border-white/10 bg-[#101826] text-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] relative">
                    <div className="flex items-center justify-between border-b border-white/8 px-6 py-5 sm:px-8">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#8ea0b8]">
                                {mode === "publish" ? "Publish Review" : "Preview"}
                            </p>
                            <h2 className="mt-2 text-xl font-semibold text-[#eef4ff]">
                                {mode === "publish" ? "Preview Before Publish" : "Blog Preview"}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPreview(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#151d2c] text-[#dbe5f3] transition hover:border-[#31425e] hover:bg-[#182438]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2 border-b border-white/8 px-6 py-5 sticky bg-[#101826] top-0 sm:px-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab("general")}
                            className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "general"
                                ? "border border-white/10 bg-[#101826] text-[#eef4ff] shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
                                : "text-[#8ea0b8] hover:bg-white/[0.03] hover:text-white"
                                }`}
                        >
                            General Content
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("platforms")}
                            className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "platforms"
                                ? "border border-white/10 bg-[#101826] text-[#eef4ff] shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
                                : "text-[#8ea0b8] hover:bg-white/[0.03] hover:text-white"
                                }`}
                        >
                            Linked Platforms
                        </button>
                        
                        {!id && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("status_tracking")}
                                className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "status_tracking"
                                    ? "border border-white/10 bg-[#101826] text-[#eef4ff] shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
                                    : "text-[#8ea0b8] hover:bg-white/[0.03] hover:text-white"
                                    }`}
                            >
                                Status Tracking
                            </button>
                        )}
                    </div>

                    {activeTab === "general" && (
                        <GeneralTabContent
                            categoryNames={categoryNames}
                            title={title}
                            excerpt={excerpt}
                            readingTime={readingTime}
                            publishDate={publishDate}
                            updateDate={updateDate}
                            createDate={createDate}
                            image={image}
                            formContent={formContent}
                            faq={faq}
                            tags={tags}
                            relatedBlogs={relatedBlogs}
                            allBlogs={allBlogs}
                            selectedPlatforms={selectedPlatforms}
                            platformData={platformData}
                            platformSettings={platformSettings}
                        />
                    )}

                    {activeTab === "status_tracking" && (
                        <PublishStatusTracking
                            globalStatus={globalStatus}
                            updateDate={updateDate}
                            currentBlogStatus={currentBlogStatus}
                            publishHistory={publishHistory}
                            publishHistoryLoading={publishHistoryLoading}
                        />
                    )}

                    {activeTab === "platforms" && (
                        <PlatformSpecificPreview
                            title={title}
                            excerpt={excerpt}
                            selectedPlatforms={selectedPlatforms}
                            platformData={platformData}
                            platformSettings={platformSettings}
                        />
                    )}

                    {mode === "publish" && (
                        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-white/8 bg-[#101826]/95 px-6 py-4 backdrop-blur sm:px-8">
                            <button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmPublish}
                                className="rounded-xl bg-[#eef4ff] px-4 py-2 font-medium text-[#0f1724] transition hover:bg-white"
                            >
                                Confirm And Publish
                            </button>
                        </div>
                    )}
                </div>
            </ClickOutside>
        </div>
    );
};

export default BlogPreviewModal;
