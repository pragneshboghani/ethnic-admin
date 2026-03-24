'use client';

import { BlogSidebarProps } from '@/types';
import { Trash2 } from 'lucide-react';

const BlogSidebar = ({ register, categories, category, setValue, image, handleRemoveImage, setIsCategoryModalOpen, setIsUploadModalOpen, setMediaFor }: BlogSidebarProps) => (

    <>
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
                            {...register("globalStatus")}
                            className="w-full px-3 py-2 bg-slate-50 text-black rounded-lg focus:outline-none text-sm"
                        >
                            <option value="draft" className="text-black">Draft</option>
                            <option value="future" className="text-black">Scheduled</option>
                            <option value="publish" className="text-black">Published</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                        <input
                            type="datetime-local"
                            placeholder="YYYY-MM-DDTHH:mm"
                            {...register("publishDate")}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-black text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Category
                        </label>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">

                            {/* Add New */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    + Add New Category
                                </button>
                            </div>

                            {/* Category List */}
                            {categories.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={category.includes(cat.id)}
                                        onChange={() => {
                                            let updated;

                                            if (category.includes(cat.id)) {
                                                updated = category.filter(id => id !== cat.id);
                                            } else {
                                                updated = [...category, cat.id];
                                            }

                                            setValue("category", updated);
                                        }}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span className="text-sm text-black">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl space-y-4 glass-card">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    {/* <ImageIcon size={18} className="text-indigo-600" /> */}
                    Featured Image
                </h3>

                <div className="aspect-video glass-card flex flex-col items-center justify-center text-center">
                    {image ? (
                        <div className="relative w-full h-full group">
                            <img
                                src={
                                    image?.startsWith("blob:")
                                        ? image
                                        : `${process.env.BACKEND_DOMAIN}/${image}`
                                }
                                alt="Selected"
                                className="w-full h-full object-cover rounded-xl"
                            />

                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-white">Select Featured Image</p>
                    )}

                    <div className="flex gap-3 my-4">
                        <button
                            type="button"
                            onClick={() => {
                                setMediaFor('feature');
                                setIsUploadModalOpen(true)
                            }}
                            className="btn"
                        >
                            Select Image
                        </button>
                    </div>
                </div>
            </div>
        </div></>
);

export default BlogSidebar