"use client";

import { BlogGeneralSectionProps } from "@/types";
import { useFieldArray } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import RichTextToolbar from "./RichTextToolbar";

const BlogGeneralSection = ({ register, control, setValue, relatedBlogs, content, allBlogs, platformData, selectedTags, setIsPopupOpen, tagsList, setIsTagModalOpen }: BlogGeneralSectionProps) => {
    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: "faq",
    });

    return (
        <div className="space-y-6 rounded-2xl p-6 md:p-8 glass-card">
            <div className="space-y-2">
                <label className="text-sm font-semibold">Blog Title</label>
                <input
                    {...register("title")}
                    placeholder="Enter a catchy title..."
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-lg font-medium text-black transition-all focus:border-none focus:outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Short Excerpt</label>
                <textarea
                    {...register("excerpt")}
                    placeholder="Brief summary for cards and search results..."
                    rows={3}
                    className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-black transition-all focus:border-none focus:outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Content</label>

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
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none"
                    >
                        + Add FAQ
                    </button>
                </div>

                {faqFields.length > 0 ? (
                    <div className="space-y-4">
                        {faqFields.map((field, index) => (
                            <div key={field.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-black">FAQ {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="text-sm font-medium text-red-600 transition-all hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-black">Question</label>
                                    <input
                                        {...register(`faq.${index}.question`)}
                                        placeholder="Enter FAQ question..."
                                        className="w-full rounded-xl bg-[#1a1a1ac7] px-4 py-3 text-sm text-white transition-all focus:border-none focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-black">Answer</label>
                                    <textarea
                                        {...register(`faq.${index}.answer`)}
                                        placeholder="Write the answer..."
                                        rows={3}
                                        className="w-full rounded-xl bg-[#1a1a1ac7] px-4 py-3 text-sm text-white transition-all focus:border-none focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        No FAQ items added yet.
                    </div>
                )}
            </div>
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Tags</label>
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div>
                            <button
                                type="button"
                                onClick={() => setIsTagModalOpen(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                + Add New Tag
                            </button>
                        </div>
                        {tagsList.map((tag) => (
                            <label key={tag.id} className="flex cursor-pointer items-center gap-2">
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
                                    className="h-4 w-4 accent-blue-600"
                                />
                                <span className="text-sm text-black">{tag.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {allBlogs.data.length > 0 && (
                    <div className="m-0">
                        <label className="text-sm font-semibold">Related Blogs</label>
                        <button
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
                    <label className="text-sm font-semibold">Reading Time (minutes)</label>
                    <input
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
