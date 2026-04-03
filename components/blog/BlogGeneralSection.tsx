"use client";

import { BlogGeneralSectionProps } from "@/types";
import { useFieldArray } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import RichTextToolbar from "./RichTextToolbar";
import { Trash2 } from "lucide-react";

const BlogGeneralSection = ({ register, control, setValue, relatedBlogs, content, allBlogs, platformData, selectedTags, setIsPopupOpen, tagsList, setIsTagModalOpen }: BlogGeneralSectionProps) => {
    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: "faq",
    });
    const sortedTagsList = [...tagsList].sort((a, b) => {
        const aSelected = selectedTags.includes(a.id);
        const bSelected = selectedTags.includes(b.id);

        if (aSelected === bSelected) {
            return a.name.localeCompare(b.name);
        }

        return aSelected ? -1 : 1;
    });

    return (
        <div className="space-y-6 rounded-2xl p-6 md:p-8 glass-card">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold">Blog Title</label>
                <input
                    {...register("title")}
                    id="title"
                    placeholder="Enter a catchy title..."
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-lg font-medium text-black transition-all focus:border-none focus:outline-none"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-semibold">Short Excerpt</label>
                <textarea
                    {...register("excerpt")}
                    id="excerpt"
                    placeholder="Brief summary for cards and search results..."
                    rows={3}
                    className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-black transition-all focus:border-none focus:outline-none"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-semibold">Content</label>

                <div className="blog-editor overflow-hidden rounded-xl border border-slate-200 bg-white text-black shadow-sm">
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
                                className: "min-h-[420px] border-0 shadow-none",
                            }}
                            className="min-h-[420px] px-4 py-3 text-sm text-black focus:outline-none"
                            placeholder="Write your blog content here or switch to HTML mode..."
                            id="content"
                        />
                    </EditorProvider>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <label className="text-sm font-semibold">FAQ Section</label>
                        <p className="text-xs text-slate-300">Add common questions and answers for this blog.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => appendFaq({ question: "", answer: "" })}
                        className="btn"
                    >
                        + Add FAQ
                    </button>
                </div>

                {faqFields.length > 0 ? (
                    <div className="space-y-4">
                        {faqFields.map((field, index) => (
                            <div key={field.id} className="space-y-3 glass-card  p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-white">FAQ {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="text-sm font-medium text-red-600 transition-all hover:text-red-700"
                                    >
                                        <Trash2 size={19} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor={`faq-question-${index}`} className="text-sm font-medium text-white">Question</label>
                                    <input
                                        id={`faq-question-${index}`}
                                        {...register(`faq.${index}.question`)}
                                        placeholder="Enter FAQ question..."
                                        className="w-full rounded-xl bg-slate-50 px-4 py-2.5 text-lg font-medium text-black transition-all focus:border-none focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor={`faq-answer-${index}`} className="text-sm font-medium text-white">Answer</label>
                                    <textarea
                                        id={`faq-answer-${index}`}
                                        {...register(`faq.${index}.answer`)}
                                        placeholder="Write the answer..."
                                        rows={3}
                                        className="w-full rounded-xl bg-slate-50 px-4 py-2.5 text-lg font-medium text-black transition-all focus:border-none focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 glass-card text-center text-md text-gray-500">
                        No FAQ items added yet.
                    </div>
                )}
            </div>

            <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center gap-3">
                    <label className="text-md font-semibold">Tags</label>
                    <button
                        type="button"
                        onClick={() => setIsTagModalOpen(true)}
                        className="btn"
                    >
                        + Add New Tag
                    </button>
                </div>
                <div className="max-h-50 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                        {sortedTagsList.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);

                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                        const updatedTags = isSelected
                                            ? selectedTags.filter((id) => id !== tag.id)
                                            : [...selectedTags, tag.id];

                                        setValue("tags", updatedTags, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        });
                                    }}
                                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${isSelected
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
                {allBlogs.data.length > 0 && (
                    <div className="m-0">
                        <label htmlFor="related-blogs-trigger" className="text-sm font-semibold">Related Blogs</label>
                        <button
                            id="related-blogs-trigger"
                            type="button"
                            onClick={() => setIsPopupOpen(true)}
                            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-white transition-all focus:outline-none"
                        >
                            Select Related Blogs
                        </button>
                        {relatedBlogs.length > 0 && (
                            <ol className="mt-2 list-inside list-decimal space-y-1">
                                {relatedBlogs.map((blogId) => {
                                    const blog = allBlogs.data.find((b) => b.id === blogId);
                                    if (!blog) return null;

                                    return (
                                        <li key={blogId} className="truncate text-sm text-white">
                                            {blog.blog_title}
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                )}

                <div className="m-0">
                    <label htmlFor="reading-time" className="text-sm font-semibold">Reading Time (minutes)</label>
                    <input
                        id="reading-time"
                        type="number"
                        {...register("reading_time", { valueAsNumber: true })}
                        placeholder="Enter reading time in minutes"
                        className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-black transition-all focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default BlogGeneralSection;
