import { formatDateTime } from "@/utils/formatDateTime";
import { PreviewPlatform } from "./BlogPreviewModal";
import { GeneralTabContentProps } from "@/types";

const GeneralTabContent = ({ categoryNames, title, excerpt, readingTime, publishDate, updateDate, createDate, image, formContent, faq, tags, relatedBlogs, allBlogs, selectedPlatforms, platformData, platformSettings, }: GeneralTabContentProps) => {
    return (
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {categoryNames.length > 0 && (
                            <span className="rounded-full border border-white/8 bg-[#151d2c] px-3 py-1.5 text-sm text-[#dbe5f3]">
                                {categoryNames.join(", ")}
                            </span>
                        )}
                        <span className="rounded-full border border-white/8 bg-[#151d2c] px-3 py-1.5 text-sm text-[#8ea0b8]">
                            {readingTime || 0} min read
                        </span>
                    </div>

                    {title && (<h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#eef4ff]">{title}</h1>)}

                    {excerpt && (
                        <div className="rounded-[20px] border border-white/8 bg-[#151d2c] px-5 py-4">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                Short Excerpt
                            </p>
                            <p className="mt-3 text-base leading-7 text-[#dbe5f3]">
                                {excerpt}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                        {publishDate && (
                            <div className="rounded-[20px] border border-white/8 bg-[#151d2c] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                    Publish Date
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[#dbe5f3]">{formatDateTime(publishDate)}</p>
                            </div>
                        )}
                        {updateDate && (
                            <div className="rounded-[20px] border border-white/8 bg-[#151d2c] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                    Last Update
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[#dbe5f3]">{formatDateTime(updateDate)}</p>
                            </div>
                        )}
                        {createDate && (
                            <div className="rounded-[20px] border border-white/8 bg-[#151d2c] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                    Created Date
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[#dbe5f3]">{formatDateTime(createDate)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {image && (
                    <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#151d2c]">
                        <img
                            src={image.startsWith("blob:") ? image : `${process.env.BACKEND_DOMAIN}/${image}`}
                            alt={title || "Blog preview"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>

            {formContent && (
                <div className="rounded-[24px] border border-white/8 bg-[#0f1724] p-6">
                    <div
                        className="max-w-none space-y-4 text-sm leading-7 text-[#dbe5f3] [&_a]:text-[#9ad8de] [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-[#eef4ff] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#eef4ff] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#eef4ff] [&_img]:rounded-xl [&_img]:border [&_img]:border-white/8 [&_li]:text-[#dbe5f3] [&_ol]:pl-5 [&_p]:text-[#dbe5f3] [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-white/10 [&_th]:bg-[#151d2c] [&_th]:px-3 [&_th]:py-2 [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: formContent }}
                    />
                </div>
            )}

            {faq.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[#eef4ff]">FAQ</h3>
                    <div className="mt-4 space-y-4">
                        {faq.map((item, index) => (
                            <div key={index} className="rounded-[20px] border border-white/8 bg-[#151d2c] p-5">
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7f90a8]">
                                    Question
                                </p>
                                <p className="mt-2 text-base text-[#eef4ff]">{item.question}</p>
                                <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-[#7f90a8]">
                                    Answer
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[#dbe5f3]">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tags.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[#eef4ff]">Tags</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="rounded-full border border-white/8 bg-[#151d2c] px-3 py-1.5 text-sm text-[#dbe5f3]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {relatedBlogs.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[#eef4ff]">Related Blogs</h3>
                    <div className="mt-4 space-y-3">
                        {relatedBlogs.map((blogId) => {
                            const blog = allBlogs.data.find((item) => item.id === blogId);
                            return blog ? (
                                <div
                                    key={blogId}
                                    className="rounded-[18px] border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#dbe5f3]"
                                >
                                    {blog.blog_title}
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {selectedPlatforms.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-[#eef4ff]">Platform Publishing Settings</h3>
                    {selectedPlatforms.map((platformId) => {
                        const platform = platformData?.data.find((item: PreviewPlatform) => item.id === platformId);
                        const settings = platformSettings[platformId];

                        return (
                            <div key={platformId} className="rounded-[22px] border border-white/8 bg-[#151d2c] p-5">
                                <h4 className="text-lg font-semibold text-[#eef4ff]">{platform?.platform_name}</h4>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <p className="text-sm text-[#dbe5f3]"><b>Slug:</b> {settings?.slug || "-"}</p>
                                    <p className="text-sm text-[#dbe5f3]"><b>Status:</b> {settings?.publishStatus || "draft"}</p>
                                    <p className="text-sm text-[#dbe5f3]"><b>SEO Title:</b> {settings?.seoTitle || "-"}</p>
                                    <p className="text-sm text-[#dbe5f3]"><b>Meta Description:</b> {settings?.metaDescription || "-"}</p>
                                    <p className="text-sm text-[#dbe5f3] md:col-span-2"><b>Canonical URL:</b> {settings?.canonicalUrl || "-"}</p>
                                    <p className="text-sm text-[#dbe5f3] md:col-span-2"><b>CTA:</b> {settings?.ctaButtonText} → {settings?.ctaButtonLink}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GeneralTabContent;