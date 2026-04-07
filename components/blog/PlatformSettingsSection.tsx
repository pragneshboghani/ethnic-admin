import { PlatformSettingsProps } from "@/types";
import { CheckCircle2 } from "lucide-react";

const PlatformSettingsSection = ({ platformData, selectedPlatforms, setSelectedPlatforms, platformSettings, setPlatformSettings, handlePlatformChange, title, excerpt, fields, remove, append, }: PlatformSettingsProps) => {
    const cardClassName =
        "rounded-[24px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]";
    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";
    const inputClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70";

    return (
        <div className="space-y-6">
            <div className={cardClassName}>
                <div className="border-b border-white/8 pb-5">
                    <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8]">
                        Distribution
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-[#eef4ff]">
                        Target Platforms
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#8ea0b8]">
                        Select the websites where you want to publish this blog and then fine-tune each destination.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {platformData?.data.map((platform: any) => {
                        const showPlatform =
                            platform.status === "Active" &&
                            (
                                platform.data_source === "admin" ||
                                (platform.data_source === "platform" &&
                                    platform.api_endpoint &&
                                    platform.api_endpoint.trim() !== "")
                            );
                        const isSelected = selectedPlatforms.includes(platform.id);

                        if (!showPlatform) return null;

                        return (
                            <button
                                key={platform.id}
                                type="button"
                                onClick={() => {
                                    const currentlySelected = selectedPlatforms.includes(platform.id);

                                    if (currentlySelected) {
                                        setSelectedPlatforms((prev) => prev.filter((id) => id !== platform.id));

                                        const index = fields.findIndex((field) => field.platformId === platform.id);
                                        if (index !== -1) remove(index);

                                        setPlatformSettings((prev) => {
                                            const updated = { ...prev };
                                            delete updated[platform.id];
                                            return updated;
                                        });
                                    } else {
                                        setSelectedPlatforms((prev) => [...prev, platform.id]);

                                        const slug = title
                                            ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                                            : "";

                                        append({
                                            platformId: platform.id,
                                            settings: {
                                                seoTitle: title || "",
                                                slug,
                                                publishStatus: "draft",
                                                metaDescription: excerpt || "",
                                                canonicalUrl: `${platform.website_url}/blog/${slug}`,
                                                ctaButtonText: "Read more",
                                                ctaButtonLink: `${platform.website_url}/blog/${slug}`,
                                            },
                                        });
                                    }
                                }}
                                className={`flex items-center gap-3 rounded-[20px] border p-4 text-left transition-all ${
                                    isSelected
                                        ? "border-[#31425e] bg-[#101826] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                                        : "border-white/8 bg-[#101826] hover:border-white/14 hover:bg-[#131d2c]"
                                }`}
                            >
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                                        isSelected
                                            ? "border-[#31425e] bg-[#1f2f49] text-[#eef4ff]"
                                            : "border-white/10 bg-[#151d2c] text-transparent"
                                    }`}
                                >
                                    {isSelected && <CheckCircle2 size={14} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium text-[#eef4ff]">{platform.platform_name}</div>
                                    <div className="truncate text-xs text-[#8ea0b8]">{platform.website_url}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                {selectedPlatforms.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-[#151d2c] px-6 py-12 text-center">
                        <p className="text-lg font-medium text-[#eef4ff]">No platforms selected</p>
                        <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                            Select at least one platform to configure SEO, slug, and publishing settings.
                        </p>
                    </div>
                ) : (
                    selectedPlatforms.map((platformId) => {
                        const platform = platformData?.data.find((item: any) => item.id === platformId);
                        if (!platform) return null;

                        return (
                            <div key={platformId} className={cardClassName}>
                                <div className="flex flex-col gap-2 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-[#eef4ff]">{platform.platform_name}</h4>
                                        <p className="mt-1 text-sm text-[#8ea0b8]">{platform.website_url}</p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs text-[#8ea0b8]">
                                        Platform Settings
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor={`platform-slug-${platformId}`} className={labelClassName}>URL Slug</label>
                                        <input
                                            id={`platform-slug-${platformId}`}
                                            type="text"
                                            placeholder="/your-blog-slug"
                                            value={platformSettings[platformId]?.slug || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "slug", e.target.value)}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor={`platform-publish-status-${platformId}`} className={labelClassName}>Publish Status</label>
                                        <select
                                            id={`platform-publish-status-${platformId}`}
                                            value={platformSettings[platformId]?.publishStatus || "draft"}
                                            onChange={(e) => handlePlatformChange(platformId, "publishStatus", e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="future">Scheduled</option>
                                            <option value="publish">Published</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 lg:col-span-2">
                                        <label htmlFor={`platform-seo-title-${platformId}`} className={labelClassName}>SEO Title</label>
                                        <input
                                            id={`platform-seo-title-${platformId}`}
                                            type="text"
                                            placeholder="Enter SEO title..."
                                            value={platformSettings[platformId]?.seoTitle || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "seoTitle", e.target.value)}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2 lg:col-span-2">
                                        <label htmlFor={`platform-meta-description-${platformId}`} className={labelClassName}>Meta Description</label>
                                        <textarea
                                            id={`platform-meta-description-${platformId}`}
                                            placeholder="Enter meta description..."
                                            rows={4}
                                            value={platformSettings[platformId]?.metaDescription || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "metaDescription", e.target.value)}
                                            className={`${inputClassName} resize-none`}
                                        />
                                    </div>

                                    <div className="space-y-2 lg:col-span-2">
                                        <label htmlFor={`platform-canonical-url-${platformId}`} className={labelClassName}>Canonical URL</label>
                                        <input
                                            id={`platform-canonical-url-${platformId}`}
                                            type="text"
                                            placeholder="https://..."
                                            value={platformSettings[platformId]?.canonicalUrl || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "canonicalUrl", e.target.value)}
                                            disabled
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor={`platform-cta-text-${platformId}`} className={labelClassName}>CTA Button Text</label>
                                        <input
                                            id={`platform-cta-text-${platformId}`}
                                            type="text"
                                            placeholder="Learn More"
                                            value={platformSettings[platformId]?.ctaButtonText || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "ctaButtonText", e.target.value)}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor={`platform-cta-link-${platformId}`} className={labelClassName}>CTA Button Link</label>
                                        <input
                                            id={`platform-cta-link-${platformId}`}
                                            type="text"
                                            placeholder="https://..."
                                            value={platformSettings[platformId]?.ctaButtonLink || ""}
                                            onChange={(e) => handlePlatformChange(platformId, "ctaButtonLink", e.target.value)}
                                            disabled
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PlatformSettingsSection;
