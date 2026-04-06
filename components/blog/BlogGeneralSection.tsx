"use client";

import { BlogGeneralSectionProps } from "@/types";
import { Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import RichTextToolbar from "./RichTextToolbar";

const BlogGeneralSection = ({
    register,
    control,
    setValue,
    relatedBlogs,
    content,
    allBlogs,
    platformData,
    selectedTags,
    setIsPopupOpen,
    tagsList,
    setIsTagModalOpen,
}: BlogGeneralSectionProps) => {
    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: "faq",
    });

    const cardClassName =
        "rounded-[24px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] md:p-8";
    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";
    const inputClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";
    const largeInputClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3.5 text-lg font-medium text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";

    return (
        <div className="space-y-6">
            <div className={cardClassName}>
                <div className="border-b border-white/8 pb-6">
                    <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8]">
                        Writing Canvas
                    </span>
                    <h2 className="mt-4 text-xl font-semibold text-[#eef4ff]">Shape the article content</h2>
                    <p className="mt-2 text-sm leading-7 text-[#8ea0b8]">
                        Add the title, summary, and full article body before moving into distribution settings.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="space-y-2.5">
                        <label className={labelClassName}>Blog Title</label>
                        <input
                            {...register("title")}
                            placeholder="Enter a catchy title..."
                            className={largeInputClassName}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className={labelClassName}>Short Excerpt</label>
                        <textarea
                            {...register("excerpt")}
                            placeholder="Brief summary for cards and search results..."
                            rows={4}
                            className={`${inputClassName} resize-none py-3.5`}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <label className={labelClassName}>Content</label>
                            <p className="text-xs text-[#6f8096]">Rich text editor with HTML mode support</p>
                        </div>

                        <div className="blog-editor overflow-hidden rounded-[22px] border border-white/8 bg-[#101826] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                            <EditorProvider>
                                <RichTextToolbar platformData={platformData} content={content || ""} />
                                <Editor
                                    value={content || ""}
                                    onChange={(e) =>
                                        setValue("content", e.target.value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                    containerProps={{
                                        className: "min-h-[420px] border-0 bg-[#0f1724] shadow-none",
                                    }}
                                    className="min-h-[420px] bg-[#0f1724] px-4 py-4 text-sm leading-7 text-[#dbe5f3] focus:outline-none"
                                    placeholder="Write your blog content here or switch to HTML mode..."
                                />
                            </EditorProvider>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cardClassName}>
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-5">
                    <div>
                        <h3 className="text-lg font-semibold text-[#eef4ff]">FAQ Section</h3>
                        <p className="mt-1 text-sm text-[#8ea0b8]">
                            Add common questions and answers for this article.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => appendFaq({ question: "", answer: "" })}
                        className="rounded-xl border border-white/10 bg-[#101826] px-4 py-2 text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e] hover:bg-[#182438]"
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
                                    className="space-y-4 rounded-[22px] border border-white/8 bg-[#101826] p-5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="text-sm font-semibold text-[#eef4ff]">FAQ {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeFaq(index)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-[#141d2b] text-[#f3b3b3] transition hover:border-red-400/30 hover:text-red-300"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClassName}>Question</label>
                                        <input
                                            {...register(`faq.${index}.question`)}
                                            placeholder="Enter FAQ question..."
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClassName}>Answer</label>
                                        <textarea
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
                        <div className="rounded-[22px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 text-center">
                            <p className="text-base font-medium text-[#dbe5f3]">No FAQ items added yet</p>
                            <p className="mt-2 text-sm text-[#8ea0b8]">
                                Add FAQs if you want the post to answer common reader questions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_240px]">
                <div className={cardClassName}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-[#eef4ff]">Tags</h3>
                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                Choose labels that help organize and surface the post.
                            </p>
                        </div>
                        <span className="rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs text-[#8ea0b8]">
                            {selectedTags.length} selected
                        </span>
                    </div>

                    <div className="mt-5 max-h-56 space-y-2 overflow-y-auto rounded-[20px] border border-white/8 bg-[#101826] p-4">
                        <div className="pb-2">
                            <button
                                type="button"
                                onClick={() => setIsTagModalOpen(true)}
                                className="rounded-full border border-white/10 bg-[#151d2c] px-3 py-1.5 text-sm text-[#9ad8de] transition hover:border-[#2f6670] hover:text-[#c2edf0]"
                            >
                                + Add New Tag
                            </button>
                        </div>
                        {tagsList.map((tag) => (
                            <label
                                key={tag.id}
                                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={(e) => {
                                        let updatedTags;

                                        if (e.target.checked) {
                                            updatedTags = [...selectedTags, tag.id];
                                        } else {
                                            updatedTags = selectedTags.filter((id) => id !== tag.id);
                                        }

                                        setValue("tags", updatedTags);
                                    }}
                                    className="h-4 w-4 accent-[#9ad8de]"
                                />
                                <span className="text-sm text-[#dbe5f3]">{tag.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {allBlogs.data.length > 0 && (
                    <div className={cardClassName}>
                        <div>
                            <h3 className="text-lg font-semibold text-[#eef4ff]">Related Blogs</h3>
                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                Link supporting articles that should appear with this post.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPopupOpen(true)}
                            className="mt-5 w-full rounded-xl border border-white/10 bg-[#101826] px-4 py-3 text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e] hover:bg-[#182438]"
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
                                            className="max-w-full truncate rounded-full border border-white/8 bg-[#101826] px-3 py-1.5 text-sm text-[#dbe5f3]"
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
                        <h3 className="text-lg font-semibold text-[#eef4ff]">Reading Time</h3>
                        <p className="mt-1 text-sm text-[#8ea0b8]">
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
        </div>
    );
};

export default BlogGeneralSection;