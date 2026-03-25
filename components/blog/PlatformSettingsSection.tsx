import { PlatformSettingsProps } from "@/types";
import { CheckCircle2 } from "lucide-react";

const PlatformSettingsSection = ({ platformData, selectedPlatforms, setSelectedPlatforms, platformSettings, setPlatformSettings,
    handlePlatformChange, title, excerpt, fields, remove, append }: PlatformSettingsProps) => (
    <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-card">
            <h3 className="text-lg font-semibold  mb-4 flex items-center gap-2">
                Target Platforms
            </h3>
            <p className="text-sm text-slate-500 mb-6">Select the websites where you want to publish this blog.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformData?.data.map((platform: any) => {
                    const ShowPlatform = platform.status === 'Active' && platform.api_endpoint && platform.api_endpoint.trim() !== "";
                    const isSelected = selectedPlatforms.includes(platform.id);
                    if (!ShowPlatform) return null;

                    return (
                        <button
                            key={platform.id}
                            type="button"
                            onClick={() => {
                                const isSelected = selectedPlatforms.includes(platform.id);

                                if (isSelected) {
                                    setSelectedPlatforms(prev => prev.filter(id => id !== platform.id));

                                    const index = fields.findIndex(f => f.platformId === platform.id);
                                    if (index !== -1) remove(index);

                                    setPlatformSettings(prev => {
                                        const updated = { ...prev };
                                        delete updated[platform.id];
                                        return updated;
                                    });
                                } else {
                                    setSelectedPlatforms(prev => [...prev, platform.id]);

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
                                        }
                                    });
                                }
                            }}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                                                    ${isSelected
                                    ? "bg-indigo-50 border-indigo-200"
                                    : "bg-white border-slate-200 hover:border-slate-300"}`
                            }
                        >
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                        ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"}`
                                }
                            >
                                {isSelected && <CheckCircle2 size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">{platform.platform_name}</div>
                                <div className="text-xs text-slate-500 truncate">{platform.website_url}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="space-y-6">
            {selectedPlatforms.length === 0 ? (
                <div className="p-6 rounded-2xl glass-card text-center text-slate-500">
                    <p>No platforms selected</p>
                    <p>Select at least one platform to configure SEO and publishing settings.</p>
                </div>
            ) : (
                selectedPlatforms.map((platformId) => {
                    const platform = platformData?.data.find((p: any) => p.id === platformId);
                    if (!platform) return null;

                    return (
                        <div key={platformId} className="p-6 rounded-2xl glass-card space-y-4">
                            <h4 className="font-semibold text-lg text-white">{platform.platform_name}</h4>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">URL Slug</label>
                                <input
                                    type="text"
                                    placeholder="/your-blog-slug"
                                    value={platformSettings[platformId]?.slug || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'slug', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Publish Status</label>
                                <select
                                    value={platformSettings[platformId]?.publishStatus || 'draft'}
                                    onChange={(e) => handlePlatformChange(platformId, 'publishStatus', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 text-black text-sm focus:outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="future">Scheduled</option>
                                    <option value="publish">Published</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">SEO Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter SEO title..."
                                    value={platformSettings[platformId]?.seoTitle || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'seoTitle', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Description</label>
                                <textarea
                                    placeholder="Enter meta description..."
                                    rows={3}
                                    value={platformSettings[platformId]?.metaDescription || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'metaDescription', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Canonical URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={platformSettings[platformId]?.canonicalUrl || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'canonicalUrl', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">CTA Button Text</label>
                                <input
                                    type="text"
                                    placeholder="Learn More"
                                    value={platformSettings[platformId]?.ctaButtonText || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'ctaButtonText', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">CTA Button Link</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={platformSettings[platformId]?.ctaButtonLink || ''}
                                    onChange={(e) => handlePlatformChange(platformId, 'ctaButtonLink', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

export default PlatformSettingsSection