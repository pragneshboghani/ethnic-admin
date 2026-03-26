"use client";

import { BlogGeneralSectionProps } from "@/types";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import RichTextToolbar from "./RichTextToolbar";

const BlogGeneralSection = ({ register, setValue, relatedBlogs, content, allBlogs, platformData, selectedTags, setIsPopupOpen, tagsList, setIsTagModalOpen }: BlogGeneralSectionProps) => {
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
                        <RichTextToolbar platformData={platformData} />
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

            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
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
