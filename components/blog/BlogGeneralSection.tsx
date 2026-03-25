import { BlogGeneralSectionProps } from "@/types";
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
  BtnUndo,
  BtnRedo,
} from "react-simple-wysiwyg";

const BlogGeneralSection = ({ register, setValue, relatedBlogs,content, allBlogs, selectedTags, setIsPopupOpen, tagsList, setIsTagModalOpen }: BlogGeneralSectionProps) => (
    <div className="p-6 md:p-8 rounded-2xl space-y-6 glass-card">
        <div className="space-y-2">
            <label className="text-sm font-semibold">Blog Title</label>
            <input
                {...register("title")}
                placeholder="Enter a catchy title..."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none  focus:border-none transition-all text-lg text-black font-medium"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-semibold">Short Excerpt</label>
            <textarea
                {...register("excerpt")}
                placeholder="Brief summary for cards and search results..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:border-none transition-all text-sm text-black resize-none"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-semibold">Content</label>

            <div className="rounded-xl overflow-hidden bg-white text-black">
                <EditorProvider>
                    <Toolbar>
                        <BtnBold  className="p-2"/>
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnBulletList />
                        <BtnNumberedList />
                        <BtnLink />
                        <BtnUndo />
                        <BtnRedo />
                    </Toolbar>

                    <Editor
                        value={content}
                        onChange={(e) => setValue("content", e.target.value)}
                        className="min-h-[400px] p-4"
                    />
                </EditorProvider>
            </div>
        </div>

        <div className="grid w-full gap-3 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
            <div className="space-y-2">
                <label className="text-sm font-semibold">Tags</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsTagModalOpen(true)}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add New Tag
                        </button>
                    </div>
                    {tagsList.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTags.includes(tag.id)}
                                onChange={(e) => {
                                    let updatedTags;

                                    if (e.target.checked) {
                                        updatedTags = [...selectedTags, tag.id];
                                    } else {
                                        updatedTags = selectedTags.filter(id => id !== tag.id);
                                    }

                                    setValue("tags", updatedTags);
                                }}
                                className="w-4 h-4 accent-blue-600"
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
                        className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl focus:outline-none transition-all"
                    >
                        Select Related Blogs
                    </button>
                    {relatedBlogs.length > 0 && (
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            {relatedBlogs.map((blogId, index) => {
                                const blog = allBlogs.data.find(b => b.id === blogId);
                                if (!blog) return null;
                                return (
                                    <li key={blogId} className="text-sm text-white truncate">
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
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none transition-all text-sm text-black"
                />
            </div>
        </div>

    </div>
);

export default BlogGeneralSection