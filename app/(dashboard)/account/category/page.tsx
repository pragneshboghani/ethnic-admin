'use client';

import BlogActions from '@/actions/BlogAction';
import CategoryModal from '@/components/common/CategoryModal';
import TagModal from '@/components/common/TagModal';
import { useEffect, useState } from 'react'

const page = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenTags, setIsOpenTags] = useState(false)

    const fetchCategories = async () => {
        const res = await BlogActions.FetchCategory();
        const names = res.data.map((c: any) => c.name);
        setCategories(names);

        const Res = await BlogActions.FetchTags()
        const TagNames = Res.data.map((c: any) => c.name)
        setTags(TagNames)
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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
                        <div key={index} className='px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'>
                            {c}
                        </div>
                    ))}
                </div>
            </div>
            <div className='glass-card p-6 flex flex-col gap-4 mt-5'>
                <h2 className='text-lg'>Tags</h2>
                <div className='flex gap-4 flex-wrap'>
                    {tags.map((c, index) => (
                        <div key={index} className='px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'>
                            {c}
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