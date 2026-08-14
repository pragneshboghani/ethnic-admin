"use client";

import { BlogGeneralSectionProps } from "@/types";
import { Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import RichTextToolbar from "./RichTextToolbar";
import BlogComments from "./BlogComments";
import { useEffect, useRef, useState } from "react";

const BlogGeneralSection = ({ register, control, setValue, relatedBlogs, content, allBlogs, platformData, selectedTags, setIsPopupOpen, tagsList, setIsTagModalOpen, blogId, }: BlogGeneralSectionProps) => {
    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: "faq",
    });

    const [isSticky, setIsSticky] = useState(false);
    const stickyRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: 1 }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const cardClassName =
        "rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] md:p-8";
    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";
    const inputClassName =
        "w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";
    const largeInputClassName =
        "w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3.5 text-lg font-medium text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";
    const selectedTagDetails = tagsList.filter((tag) => selectedTags.includes(tag.id));
    const handleTagToggle = (tagId: number) => {
        const updatedTags = selectedTags.includes(tagId)
            ? selectedTags.filter((id) => id !== tagId)
            : [...selectedTags, tagId];

        setValue("tags", updatedTags, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    return (
        <div className="space-y-6">
            <div className={cardClassName}>
                <div className="border-b border-[var(--border)] pb-6">
                    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-muted)]">
                        Writing Canvas
                    </span>
                    <h2 className="mt-4 text-xl font-semibold text-[var(--text-strong)]">Shape the article content</h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                        Add the title, summary, and full article body before moving into distribution settings.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="space-y-2.5">
                        <label htmlFor="blog-title" className={labelClassName}>Blog Title</label>
                        <input
                            id="blog-title"
                            {...register("title")}
                            placeholder="Enter a catchy title..."
                            className={largeInputClassName}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label htmlFor="blog-excerpt" className={labelClassName}>Short Excerpt</label>
                        <textarea
                            id="blog-excerpt"
                            {...register("excerpt")}
                            placeholder="Brief summary for cards and search results..."
                            rows={4}
                            className={`${inputClassName} resize-none py-3.5`}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <p className={labelClassName}>Content</p>
                            <p className="text-xs text-[var(--text-faint)]">Rich text editor with HTML mode support</p>
                        </div>

                        <div className="blog-editor rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                            <EditorProvider>
                                <div ref={sentinelRef} className="h-px" />
                                <div ref={stickyRef} className={`sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg-inset)] ${isSticky ? "rounded-t-none" : "rounded-t-[24px]"}`}>
                                    <RichTextToolbar platformData={platformData} content={content || ""} />
                                </div>
                                <Editor
                                    value={content || ""}
                                    onChange={(e) => {
                                        setValue("content", e.target.value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        });
                                    }}
                                    containerProps={{
                                        className: "min-h-[420px] border-0  shadow-none",
                                    }}
                                    className="min-h-[420px]  px-4 py-4 text-sm leading-7 text-[var(--text)] focus:outline-none"
                                    placeholder="Write your blog content here or switch to HTML mode..."
                                />
                            </EditorProvider>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClassName}>
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-5">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-strong)]">FAQ Section</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Add common questions and answers for this article.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => appendFaq({ question: "", answer: "" })}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    >
                        + Add FAQ
                    </button>
                </div>

                <div className="mt-6">
                    {faqFields.length > 0 ? (
                        <div className="space-y-4">
                            {faqFields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="space-y-4 rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-sm font-semibold text-[var(--text-strong)]">FAQ {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeFaq(index)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-selected)] text-[#841515] transition hover:border-red-400/30 hover:text-red-300"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor={`faq-question-${index}`} className={labelClassName}>Question</label>
                                        <input
                                            id={`faq-question-${index}`}
                                            {...register(`faq.${index}.question`)}
                                            placeholder="Enter FAQ question..."
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor={`faq-answer-${index}`} className={labelClassName}>Answer</label>
                                        <textarea
                                            id={`faq-answer-${index}`}
                                            {...register(`faq.${index}.answer`)}
                                            placeholder="Write the answer..."
                                            rows={4}
                                            className={`${inputClassName} resize-none`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-10 text-center">
                            <p className="text-base font-medium text-[var(--text)]">No FAQ items added yet</p>
                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                Add FAQs if you want the post to answer common reader questions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className={cardClassName}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Tags</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Choose one or more labels that help organize and surface the post.
                        </p>
                    </div>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs text-[var(--text-muted)]">
                        {selectedTags.length} selected
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsTagModalOpen(true)}
                            className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--accent)] transition hover:border-[var(--status-green-text)] hover:text-[var(--status-green-text)]"
                        >
                            + Add New Tag
                        </button>
                    </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                    {selectedTagDetails.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                Selected Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedTagDetails.map((tag) => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagToggle(tag.id)}
                                        className="rounded-full border border-[#c1dde1] bg-[var(--bg-selected)] px-3 py-1.5 text-sm font-medium text-[var(--status-green-text)] transition hover:border-[#c1dee1] hover:bg-[var(--bg-selected)]"
                                    >
                                        {tag.name} x
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                            All Tags
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {tagsList.map((tag) => {
                                const isSelected = selectedTags.includes(tag.id);

                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagToggle(tag.id)}
                                        aria-pressed={isSelected}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isSelected
                                            ? "border-[#c1dde1] bg-[var(--bg-selected)] text-[var(--status-green-text)]"
                                            : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_240px]">

                {allBlogs.data.length > 0 && (
                    <div className={cardClassName}>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-strong)]">Related Blogs</h3>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Link supporting articles that should appear with this post.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPopupOpen(true)}
                            className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                        >
                            Select Related Blogs
                        </button>
                        {relatedBlogs.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {relatedBlogs.map((blogId) => {
                                    const blog = allBlogs.data.find((b) => b.id === blogId);
                                    if (!blog) return null;

                                    return (
                                        <span
                                            key={blogId}
                                            className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1.5 text-sm text-[var(--text)]"
                                        >
                                            {blog.blog_title}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className={cardClassName}>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Reading Time</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Set the estimated reading duration in minutes.
                        </p>
                    </div>
                    <input
                        type="number"
                        {...register("reading_time", { valueAsNumber: true })}
                        placeholder="Enter reading time in minutes"
                        className={`${inputClassName} mt-5`}
                    />
                </div>
            </div>
            <BlogComments blogId={blogId} />
        </div>
    );
};

export default BlogGeneralSection;
