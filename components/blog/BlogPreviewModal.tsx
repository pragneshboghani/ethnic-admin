'use client';

import { BlogPreviewModalProps } from "@/types";
import { useEffect, useMemo, useState } from "react";
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
    const [isSticky, setIsSticky] = useState(false);
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

    useEffect(() => {
        const el = document.querySelector('.modal-scroll');
        const handleScroll = () => {
            if (el) {
                setIsSticky(el.scrollTop > 114);
            }
        };

        if (el) el.addEventListener("scroll", handleScroll);

        return () => {
            if (el) el.removeEventListener("scroll", handleScroll);
        };
    }, [showPreview]);

    if (!showPreview) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4 sm:p-6">
            <ClickOutside onClickOutside={() => setShowPreview(false)}>
                <div className="modal-scroll max-h-[90vh] w-[1000px] max-w-[90vw] overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_12px_30px_rgba(15,23,42,0.12)] relative">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 sm:px-8">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
                                {mode === "publish" ? "Publish Review" : "Preview"}
                            </p>
                            <h2 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                                {mode === "publish" ? "Preview Before Publish" : "Blog Preview"}
                            </h2>
                        </div>
                        {!isSticky && (
                            <button
                            type="button"
                            onClick={() => setShowPreview(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                        >
                            <X size={18} />
                        </button>
                        )}
                    </div>

                    <div className="flex gap-2 border-b border-[var(--border)] px-6 py-5 sticky bg-[var(--bg-inset)] top-0 sm:px-8 justify-between items-center z-50">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("general")}
                                className={`flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "general"
                                    ? "border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                                    : "text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]"
                                    }`}
                            >
                                General Content
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("platforms")}
                                className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "platforms"
                                    ? "border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                                    : "text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]"
                                    }`}
                            >
                                Linked Platforms
                            </button>

                            {!id && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("status_tracking")}
                                    className={`flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-medium transition-all ${activeTab === "status_tracking"
                                        ? "border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                                        : "text-[var(--text-muted)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]"
                                        }`}
                                >
                                    Status Tracking
                                </button>
                            )}
                        </div>

                        {isSticky && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)]"
                            >
                                <X size={18} />
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
                        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--bg-inset)]/95 px-6 py-4 backdrop-blur sm:px-8 z-50">
                            <button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="rounded-xl border border-[var(--border)] px-4 py-2 text-[var(--text)] transition hover:bg-black/[0.04]"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmPublish}
                                className="rounded-xl bg-[var(--accent)] px-4 py-2 font-medium text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
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
