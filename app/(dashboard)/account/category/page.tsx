'use client';

import CategoryAndTagAction from '@/actions/categoryAndTagAction';
import CategoryModal from '@/components/common/CategoryModal';
import TagModal from '@/components/common/TagModal';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

type Category = {
    id: number;
    name: string;
}

const page = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Category[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenTags, setIsOpenTags] = useState(false)

    const fetchCategories = async () => {
        const res = await CategoryAndTagAction.fetchCategory()
        const categoryData: Category[] = res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
        }));
        setCategories(categoryData);

        const Res = await CategoryAndTagAction.fetchTags()
        const tagData: Category[] = Res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
        }));
        setTags(tagData)
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (category: Category, type: string) => {
        if (!category) return null
        if (!confirm(`Are you sure you want to delete ${type} "${category?.name}"?`)) return;
        try {
            await CategoryAndTagAction.deleteCategory(category?.id, type)
            fetchCategories();
            toast.success(`${type} successfully deleted! 🗑️`)
        } catch (error) {
            console.error('Failed to delete category or tag', error);
            alert('Failed to delete category or tag.');
        }
    };
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold">Categories & Tags</h1>
                    <p className="text-gray-400 text-sm">
                        Manage your multi-platform content strategy.
                    </p>
                </div>

                <div className='flex gap-5'>
                    <button className='btn' onClick={() => setIsOpen(true)}>
                        + Create Category
                    </button>
                    <button className='btn' onClick={() => setIsOpenTags(true)}>
                        + Create Tag
                    </button>
                </div>
            </div>
            <div className='glass-card p-6 flex flex-col gap-4'>
                <h2 className='text-lg'>Categories</h2>
                <div className='flex gap-4 flex-wrap'>
                    {categories.map((c, index) => (
                        <div
                            key={c.id}
                            className='relative group px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'
                        >
                            {c.name}
                            {/* Delete icon appears on hover */}
                            <Trash2
                                className="absolute top-1 right-1 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                onClick={() => handleDeleteCategory(c, 'category')}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className='glass-card p-6 flex flex-col gap-4 mt-5'>
                <h2 className='text-lg'>Tags</h2>
                <div className='flex gap-4 flex-wrap'>
                    {tags.map((c, index) => (
                        <div
                            key={c.id}
                            className='relative group px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'
                        >
                            {c.name}
                            {/* Delete icon appears on hover */}
                            <Trash2
                                className="absolute top-1 right-1 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                onClick={() => handleDeleteCategory(c,'tags')}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {isOpen && (
                <CategoryModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSuccess={fetchCategories}
                />
            )}
            {isOpenTags && (
                <TagModal
                    isOpen={isOpenTags}
                    onClose={() => setIsOpenTags(false)}
                    onSuccess={fetchCategories}
                />
            )}
        </>
    )
}

export default page