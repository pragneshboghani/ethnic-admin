import { EditorContent } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";

type BlogGeneralSectionProps = {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    excerpt: string;
    setExcerpt: React.Dispatch<React.SetStateAction<string>>;
    editor: any;
    handleTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tags: string[];
    relatedBlogs: any[];
    allBlogs: { data: any[] };
    setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
    readingTime: number;
    setReadingTime: React.Dispatch<React.SetStateAction<number>>;
};

const BlogGeneralSection = ({
    title,
    setTitle,
    excerpt,
    setExcerpt,
    editor,
    handleTagsChange,
    tags,
    relatedBlogs,
    allBlogs,
    setIsPopupOpen,
    setReadingTime,
}: BlogGeneralSectionProps) => (
    <div className="p-6 md:p-8 rounded-2xl space-y-6 glass-card">
        <div className="space-y-2">
            <label className="text-sm font-semibold">Blog Title</label>
            <input
                placeholder="Enter a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none  focus:border-none transition-all text-lg text-black font-medium"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-semibold">Short Excerpt</label>
            <textarea
                placeholder="Brief summary for cards and search results..."
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:border-none transition-all text-sm text-black resize-none"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-semibold">Content</label>
            <div className="rounded-xl overflow-hidden focus-within:border-none text-black transition-all">
                <EditorToolbar editor={editor} />
                <EditorContent editor={editor} className={`ProseMirror max-w-none p-4 min-h-[400px] bg-white text-black focus:outline-none !focus-visible:outline-none`} />
            </div>
        </div>

        <div className="space-y-2 flex w-full justify-between gap-3">

            <div className="m-0">
                <label className="text-sm font-semibold">Tags (comma separated)</label>
                <input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    onChange={handleTagsChange}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none transition-all text-sm text-black"
                />
                <div className="mt-2">
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="m-0 max-w-[200px]">
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

            <div className="m-0">
                <label className="text-sm font-semibold">Reading Time (minutes)</label>
                <input
                    type="number"
                    placeholder="Enter reading time in minutes"
                    // value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none transition-all text-sm text-black"
                />
            </div>
        </div>

    </div>
);

export default BlogGeneralSection