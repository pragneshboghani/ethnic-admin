'use client';

import { useEffect, useState } from "react";
import { Save, Settings2, Image as ImageIcon, Send, CheckCircle2 } from 'lucide-react';
import PlateformActions from "@/actions/PlateFormActions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import EditorToolbar from "@/components/blog/EditorToolbar";
import BlogActions from "@/actions/BlogAction";

const BlogForm = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'platforms'>('general');
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
    const [platformData, setPlatformData] = useState<any>(null);
    const [formContent, setFormContent] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [ctaButtonText, setCtaButtonText] = useState('');
    const [ctaButtonLink, setCtaButtonLink] = useState('');
    const [slug, setSlug] = useState('');
    const [publishStatus, setPublishStatus] = useState('draft');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('software-development');
    const [publishDate, setPublishDate] = useState<string>('');
    const [globalStatus, setGlobalStatus] = useState('DRAFT');
    const [tags, setTags] = useState<string[]>([]);
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [allBlogs, setAllBlogs] = useState<{ data: any[] }>({ data: [] });
    const [readingTime, setReadingTime] = useState<number>(0);

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res.data);
        };
        fetchPlatforms();
        const loadBlogs = async () => {
            const blogs = await BlogActions.GetAllBlogs()
            setAllBlogs(blogs);
        };
        loadBlogs();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: true }),
        ],
        content: formContent,
        immediatelyRender: false,
        editorProps: {
            handlePaste(view, event, slice) {
                const html = event.clipboardData?.getData('text/html');
                if (html) {
                    view.dispatch(
                        view.state.tr.replaceSelectionWith(
                            view.state.schema.text(html), false
                        )
                    );
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            setFormContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(formContent);
        }
    }, [editor, formContent]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            blog_title: title,
            short_excerpt: excerpt,
            full_content: formContent,
            platforms: selectedPlatforms,
            featured_image: image,
            seo_title: seoTitle,
            meta_description: metaDescription,
            canonical_url: canonicalUrl,
            cta_button_text: ctaButtonText,
            cta_button_link: ctaButtonLink,
            slug: slug,
            publish_status: publishStatus,
            author: author,
            category: category,
            publishDate,
            globalStatus,
            tags,
            related_blogs: relatedBlogs,
            reading_time: readingTime,
        };

        // Log the form data to the console
        console.log(formData);
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        setTags(newTags);
    };

    const handleBlogSelect = (blogId: number) => {
        setRelatedBlogs(prev => {
            if (prev.includes(blogId)) {
                return prev.filter(id => id !== blogId);
            }
            return [...prev, blogId];
        });
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 glass-card">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Blog</h1>
                    <p className="text-slate-500 mt-1">Draft a new blog and choose where to publish.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" className="btn btn-secondary">
                        <Save size={18} />
                        Save Draft
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Send size={18} />
                        Publish All
                    </button>
                </div>
            </div>

            <div className="flex glass-card">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'general'
                        ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    General Content
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('platforms')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'platforms'
                        ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    Platforms & SEO
                    {selectedPlatforms.length > 0 && (
                        <span className="text-white rounded ml-[10px]">
                            {`(${selectedPlatforms.length})`}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'general' ? (
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

                            <div className="space-y-2 flex w-full justify-between">

                                <div className="">
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

                                <div className="">
                                    <label className="text-sm font-semibold">Related Blogs</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsPopupOpen(true)}
                                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl focus:outline-none transition-all"
                                    >
                                        Select Related Blogs
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Reading Time (minutes)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Enter reading time in minutes"
                                        value={readingTime}
                                        onChange={(e) => setReadingTime(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:outline-none transition-all text-sm text-black"
                                    />
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl glass-card">
                                <h3 className="text-lg font-semibold  mb-4 flex items-center gap-2">
                                    Target Platforms
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">Select the websites where you want to publish this blog.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {platformData?.data.map((platform: any) => {
                                        const isSelected = selectedPlatforms.includes(platform.id);

                                        return (
                                            <button
                                                key={platform.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPlatforms((prev) =>
                                                        isSelected
                                                            ? prev.filter((id) => id !== platform.id)
                                                            : [...prev, platform.id]
                                                    );
                                                }}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                                                    ${isSelected
                                                        ? "bg-indigo-50 border-indigo-200"
                                                        : "bg-white border-slate-200 hover:border-slate-300"}`
                                                }
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                        ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"}`
                                                    }
                                                >
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-900 truncate">{platform.platform_name}</div>
                                                    <div className="text-xs text-slate-500 truncate">{platform.website_url}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {selectedPlatforms.length === 0 ? (
                                    <div className="p-6 rounded-2xl glass-card text-center text-slate-500">
                                        <p>No platforms selected</p>
                                        <p>Select at least one platform to configure SEO and publishing settings.</p>
                                    </div>
                                ) : (
                                    selectedPlatforms.map((platformId) => {
                                        const platform = platformData?.data.find((p: any) => p.id === platformId);
                                        if (!platform) return null;

                                        return (
                                            <div key={platformId} className="p-6 rounded-2xl glass-card space-y-4">
                                                <h4 className="font-semibold text-lg text-white">{platform.platform_name}</h4>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">URL Slug</label>
                                                    <input
                                                        type="text"
                                                        placeholder="/your-blog-slug"
                                                        value={slug}
                                                        onChange={(e) => setSlug(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Publish Status</label>
                                                    <select
                                                        value={publishStatus}
                                                        onChange={(e) => setPublishStatus(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 text-black text-sm focus:outline-none"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">SEO Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter SEO title..."
                                                        value={seoTitle}
                                                        onChange={(e) => setSeoTitle(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Meta Description</label>
                                                    <textarea
                                                        placeholder="Enter meta description..."
                                                        rows={3}
                                                        value={metaDescription}
                                                        onChange={(e) => setMetaDescription(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black resize-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Canonical URL</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        value={canonicalUrl}
                                                        onChange={(e) => setCanonicalUrl(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">CTA Button Text</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Learn More"
                                                        value={ctaButtonText}
                                                        onChange={(e) => setCtaButtonText(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">CTA Button Link</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        value={ctaButtonLink}
                                                        onChange={(e) => setCtaButtonLink(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 focus:outline-none text-sm text-black"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 glass-card">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            {/* <Settings2 size={18} className="text-indigo-600" /> */}
                            Publishing Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Status</label>
                                <select
                                    value={globalStatus}
                                    onChange={(e) => setGlobalStatus(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 text-black rounded-lg focus:outline-none text-sm"
                                >
                                    <option value="DRAFT" className="text-black">Draft</option>
                                    <option value="SCHEDULED" className="text-black">Scheduled</option>
                                    <option value="PUBLISHED" className="text-black">Published</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                                <input
                                    type="date"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-black text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-black text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-black focus:outline-none  text-sm"
                                >
                                    <option value="software-development" className="text-black">Software Development</option>
                                    <option value="industry-trends" className="text-black">IT Industry Trends</option>
                                    <option value="project-management" className="text-black">Project Management</option>
                                    <option value="tutorials" className="text-black">Tech Tutorials & How-Tos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl space-y-4 glass-card">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            {/* <ImageIcon size={18} className="text-indigo-600" /> */}
                            Featured Image
                        </h3>

                        <div className="aspect-video bg-slate-50 rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer transition-colors relative">
                            {image ? (
                                <>
                                    <img
                                        src={image}
                                        alt="Selected"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={32} className="text-slate-300 mb-2 group-hover:text-indigo-400 transition-colors" />
                                    <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h3 className="text-xl font-semibold text-black mb-4">Select Related Blogs</h3>
                        <div className="space-y-2">
                            {allBlogs.data.map(blog => (
                                <div key={blog.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={relatedBlogs.includes(blog.id)}
                                        onChange={() => handleBlogSelect(blog.id)}
                                        className="mr-3"
                                    />
                                    <label className="text-sm text-black">{blog.blog_title}</label>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-4">
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="btn btn-primary"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default BlogForm;