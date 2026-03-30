'use client';

import { X } from "lucide-react";
import { formatDateTime } from "@/utils/formatDateTime";
import { BlogPreviewModalProps } from "@/types";

const BlogPreviewModal = ({
    showPreview, setShowPreview, image, category, categories, publishDate, readingTime, title, excerpt, formContent, tags,
    relatedBlogs, allBlogs, selectedPlatforms, platformData, platformSettings, faq }: BlogPreviewModalProps) => {

    if (!showPreview) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="w-[1000px] max-h-[90vh] overflow-y-auto rounded-2xl text-white glass-card">
                <div className="flex justify-between items-center border-b p-6">
                    <h2 className="text-xl font-bold">Blog Preview</h2>
                    <button onClick={() => setShowPreview(false)} className="text-white">
                        <X />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    {image && (
                        <img src={image.startsWith("blob:") ? image : `${process.env.BACKEND_DOMAIN}/${image}`}
                            className="w-full max-w-[30%] object-cover rounded-xl float-right aspect-square" />
                    )}
                    <div className="flex items-center gap-3 text-sm text-white justify-between pr-5">
                        <div className="flex items-center gap-3">
                            <span className="text-white glass-card p-2"><span>
                                {category
                                    .map(id => categories.find(c => c.id === id)?.name)
                                    .filter(Boolean)
                                    .join(', ')
                                }
                            </span></span>
                            {publishDate && (<span>{formatDateTime(publishDate)}</span>)}
                        </div>
                        <div className="text-white text-sm">
                            {/* {author && (<span className="font-medium"> By {author}</span>)} */}
                            {/* {" • "} */}
                            {readingTime || 0} min read
                        </div>
                    </div>
                    {title &&
                        (<div className="flex items-center gap-3 text-sm text-white justify-between">
                            <h1 className="text-4xl font-bold leading-tight">{title}</h1>
                        </div>
                        )}
                    {excerpt && (
                        <p className="text-lg text-gray-700 border-l-4 border-blue-500 pl-4 italic"><strong>Short Excerpt: </strong>{excerpt}</p>
                    )}
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formContent }} />
                    {faq.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">FAQ</h3>
                            <div className="space-y-4">
                                {faq.map((item, index) => (
                                    <div key={index} className="border rounded-xl p-4">
                                        <p className="font-medium"><strong>Question:</strong> {item.question}</p>
                                        <p><strong>Answer:</strong> {item.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {tags.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="rounded-full text-sm">
                                        {tag}{index < tags.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {relatedBlogs.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Related Blogs</h3>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                                {relatedBlogs.map((blogId) => {
                                    const blog = allBlogs.data.find(b => b.id === blogId)
                                    return blog ? (
                                        <li key={blogId}>{blog.blog_title}</li>
                                    ) : null
                                })}
                            </ul>
                        </div>
                    )}
                    {selectedPlatforms.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Platform Publishing Settings</h3>
                            {selectedPlatforms.map((platformId) => {
                                const platform = platformData?.data.find(
                                    (p: any) => p.id === platformId
                                )
                                const settings = platformSettings[platformId]
                                return (
                                    <div key={platformId} className="border rounded-xl p-4 space-y-2">
                                        <h4 className="font-semibold text-lg">{platform?.platform_name}</h4>
                                        <p><b>Slug:</b> {settings?.slug || "-"}</p>
                                        <p><b>Status:</b> {settings?.publishStatus || "draft"}</p>
                                        <p><b>SEO Title:</b> {settings?.seoTitle || "-"}</p>
                                        <p><b>Meta Description:</b> {settings?.metaDescription || "-"}</p>
                                        <p><b>Canonical URL:</b> {settings?.canonicalUrl || "-"}</p>
                                        <p><b>CTA:</b> {settings?.ctaButtonText} → {settings?.ctaButtonLink}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPreviewModal;