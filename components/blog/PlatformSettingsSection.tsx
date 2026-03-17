import { CheckCircle2 } from "lucide-react";

type PlatformSettingsProps = {
    platformData: any;
    selectedPlatforms: number[];
    setSelectedPlatforms: React.Dispatch<React.SetStateAction<number[]>>;
    platformSettings: {
        [platformId: number]: {
            seoTitle: string;
            slug: string;
            publishStatus: string;
            metaDescription: string;
            canonicalUrl: string;
            ctaButtonText: string;
            ctaButtonLink: string;
        };
    };
    setPlatformSettings: React.Dispatch<React.SetStateAction<{
        [platformId: number]: {
            seoTitle: string;
            slug: string;
            publishStatus: string;
            metaDescription: string;
            canonicalUrl: string;
            ctaButtonText: string;
            ctaButtonLink: string;
        };
    }>>;
    handlePlatformChange: (platformId: number, field: string, value: string) => void;
};

const PlatformSettingsSection = ({
    platformData,
    selectedPlatforms,
    setSelectedPlatforms,
    platformSettings,
    setPlatformSettings,
    handlePlatformChange,
}: PlatformSettingsProps) => (
    <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-card">
            <h3 className="text-lg font-semibold  mb-4 flex items-center gap-2">
                Target Platforms
            </h3>
            <p className="text-sm text-slate-500 mb-6">Select the websites where you want to publish this blog.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformData?.data.map((platform: any) => {
                    const isSelected = selectedPlatforms.includes(platform.id);

                    return (
                        <button
                            key={platform.id}
                            type="button"
                            onClick={() => {
                                setSelectedPlatforms(prev => {
                                    const newSelection = isSelected
                                        ? prev.filter(id => id !== platform.id)
                                        : [...prev, platform.id];

                                    if (!isSelected) {
                                        setPlatformSettings(ps => ({
                                            ...ps,
                                            [platform.id]: {
                                                seoTitle: "",
                                                slug: "",
                                                publishStatus: "draft",
                                                metaDescription: "",
                                                canonicalUrl: "",
                                                ctaButtonText: "",
                                                ctaButtonLink: "",
                                            }
                                        }));
                                    } else {
                                        const copy = { ...platformSettings };
                                        delete copy[platform.id];
                                        setPlatformSettings(copy);
                                    }

                                    return newSelection;
                                });
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
                                    <option value="published">Published</option>
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