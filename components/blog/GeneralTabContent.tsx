import { formatDateTime } from "@/utils/formatDateTime";
import { GeneralTabContentProps } from "@/types";

const GeneralTabContent = ({ categoryNames, title, excerpt, readingTime, publishDate, updateDate, createDate, image, formContent, faq, tags, relatedBlogs, allBlogs  }: GeneralTabContentProps) => {
    return (
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {categoryNames.length > 0 && (
                            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text)]">
                                {categoryNames.join(", ")}
                            </span>
                        )}
                        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
                            {readingTime || 0} min read
                        </span>
                    </div>

                    {title && (<h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--text-strong)]">{title}</h1>)}

                    {excerpt && (
                        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                Short Excerpt
                            </p>
                            <p className="mt-3 text-base leading-7 text-[var(--text)]">
                                {excerpt}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                        {publishDate && (
                            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Publish Date
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[var(--text)]">{formatDateTime(publishDate)}</p>
                            </div>
                        )}
                        {updateDate && (
                            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Last Update
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[var(--text)]">{formatDateTime(updateDate)}</p>
                            </div>
                        )}
                        {createDate && (
                            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                    Created Date
                                </p>
                                <p className="mt-3 text-sm leading-6 text-[var(--text)]">{formatDateTime(createDate)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {image && (
                    <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)]">
                        <img
                            src={image.startsWith("blob:") ? image : `${process.env.BACKEND_DOMAIN}/${image}`}
                            alt={title || "Blog preview"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>

            {formContent && (
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                    <div
                        className="max-w-none space-y-4 text-sm leading-7 text-[var(--text)] [&_a]:text-[var(--accent)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-[var(--text-strong)] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--text-strong)] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--text-strong)] [&_img]:rounded-xl [&_img]:border [&_img]:border-[var(--border)] [&_li]:text-[var(--text)] [&_ol]:pl-5 [&_p]:text-[var(--text)] [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_td]:border [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[var(--border)] [&_th]:bg-[var(--bg-surface)] [&_th]:px-3 [&_th]:py-2 [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: formContent }}
                    />
                </div>
            )}

            {faq.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-strong)]">FAQ</h3>
                    <div className="mt-4 space-y-4">
                        {faq.map((item, index) => (
                            <div key={index} className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                    Question
                                </p>
                                <p className="mt-2 text-base text-[var(--text-strong)]">{item.question}</p>
                                <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                    Answer
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[var(--text)]">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tags.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-strong)]">Tags</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text)]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {relatedBlogs.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-strong)]">Related Blogs</h3>
                    <div className="mt-4 space-y-3">
                        {relatedBlogs.map((blogId) => {
                            const blog = allBlogs.data.find((item) => item.id === blogId);
                            return blog ? (
                                <div
                                    key={blogId}
                                    className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text)]"
                                >
                                    {blog.blog_title}
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralTabContent;