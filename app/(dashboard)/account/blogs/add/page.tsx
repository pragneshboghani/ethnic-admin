'use client';

import { useEffect, useState } from "react";
import { Save, Globe, Settings2, Image as ImageIcon, Info, Send, CheckCircle2 } from 'lucide-react';
import PlateformActions from "@/actions/PlateFormActions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";


function EditorToolbar({ editor }: { editor: any }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
            >
                <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
            >
                <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
            >
                H2
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
            >
                List
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                active={editor.isActive('link')}
            >
                Link
            </ToolbarButton>
        </div>
    );
}

function ToolbarButton({ children, onClick, active }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
        >
            {children}
        </button>
    );
}

const BlogForm = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'platforms'>('general');
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
    const [platformData, setPlatformData] = useState<any>(null);

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res.data);
        };
        fetchPlatforms();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: true }),
        ],
        content: '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            // form.setValue('content', editor.getHTML());
        },
    });

    console.log('platformData', platformData)
    return (
        <form className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 glass-card">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Blog
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Draft a new blog and choose where to publish.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary"
                    >
                        <Save size={18} />
                        Save Draft
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        <Send size={18} />
                        Publish All
                    </button>
                </div>
            </div>

            <div className="flex glass-card">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab == 'general'
                        ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    General Content
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('platforms')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab == 'platforms'
                        ? "bg-white/20 text-white shadow-lg border border-white/20 rounded-xl"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    Platforms & SEO
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                        {selectedPlatforms.length}
                    </span>
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg font-medium"
                                />

                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Short Excerpt</label>
                                <textarea
                                    placeholder="Brief summary for cards and search results..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Content</label>
                                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <EditorToolbar editor={editor} />
                                    <EditorContent editor={editor} className={`max-w-none p-4 min-h-[400px] bg-white focus:outline-none text-black focus-visible:outline-none`} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl glass-card">
                                <h3 className="text-lg font-semibold  mb-4 flex items-center gap-2">
                                    <Globe size={20} className="text-indigo-600" />
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
                                                    setSelectedPlatforms(prev =>
                                                        isSelected
                                                            ? prev.filter(id => id !== platform.id)
                                                            : [...prev, platform.id]
                                                    );
                                                }}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                ${isSelected
                                                        ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
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

                            {/* {fields.map((field, index) => {
                const platform = platforms.find(p => p.id === field.platformId);
                const isExpanded = expandedPlatform === field.platformId;
                
                return (
                  <div key={field.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedPlatform(isExpanded ? null : field.platformId)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {platform?.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-900">{platform?.name} Settings</h4>
                          <p className="text-xs text-slate-500">Slug: /{form.watch(`platformConfigs.${index}.slug`)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          form.watch(`platformConfigs.${index}.status`) === 'PUBLISHED' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {form.watch(`platformConfigs.${index}.status`)}
                        </span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL Slug</label>
                            <div className="flex">
                              <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">/</span>
                              <input 
                                {...form.register(`platformConfigs.${index}.slug`)}
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Status</label>
                            <select 
                              {...form.register(`platformConfigs.${index}.status`)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="SCHEDULED">Scheduled</option>
                              <option value="PUBLISHED">Published</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Settings2 size={16} className="text-indigo-600" />
                            SEO & Meta
                          </h5>
                          <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700">SEO Title</label>
                              <input 
                                {...form.register(`platformConfigs.${index}.seoTitle`)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                              <textarea 
                                {...form.register(`platformConfigs.${index}.seoDescription`)}
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700">Canonical URL</label>
                              <input 
                                {...form.register(`platformConfigs.${index}.canonicalUrl`)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Plus size={16} className="text-indigo-600" />
                            Platform Specifics
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700">CTA Button Text</label>
                              <input 
                                {...form.register(`platformConfigs.${index}.ctaText`)}
                                placeholder="Learn More"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700">CTA Button Link</label>
                              <input 
                                {...form.register(`platformConfigs.${index}.ctaLink`)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <Globe size={40} className="mx-auto text-slate-300 mb-4" />
                  <h4 className="text-slate-900 font-medium">No platforms selected</h4>
                  <p className="text-sm text-slate-500 mt-1">Select at least one platform to configure SEO and publishing settings.</p>
                </div>
              )} */}
                        </div>
                    )}
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Settings2 size={18} className="text-indigo-600" />
                            Publishing Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Status</label>
                                <select
                                    //   {...form.register('status')}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                                <input
                                    type="date"
                                    //   {...form.register('publishDate')}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
                                <select
                                    //   {...form.register('authorId')}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                >
                                    {/* {authors.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))} */}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <select
                                    //   {...form.register('categoryId')}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                >
                                    {/* {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))} */}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <ImageIcon size={18} className="text-indigo-600" />
                            Featured Image
                        </h3>

                        <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:border-indigo-300 transition-colors">
                            {/* {form.watch('featuredImage') ? (
                <div className="relative w-full h-full">
                  <img src={form.watch('featuredImage')} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    type="button"
                    onClick={() => form.setValue('featuredImage', '')}
                    className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur rounded-full text-red-600 shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-slate-300 mb-2 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-xs text-slate-500">Click to upload or drag and drop</p>
                  <input 
                    type="text" 
                    placeholder="Or enter image URL"
                    className="mt-4 w-full px-2 py-1 text-[10px] bg-white border border-slate-200 rounded"
                    onChange={(e) => form.setValue('featuredImage', e.target.value)}
                  />
                </>
              )} */}
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-2xl text-white space-y-4">
                        <div className="flex items-center gap-2">
                            <Info size={18} />
                            <h4 className="font-semibold">Publishing Tip</h4>
                        </div>
                        <p className="text-sm text-indigo-100">
                            You can override the featured image and content for specific platforms in the &quot;Platforms &amp; SEO&quot; tab.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default BlogForm