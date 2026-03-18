'use client';

import BlogActions from '@/actions/BlogAction';
import CategoryModal from '@/components/common/CategoryModal';
import { useEffect, useState } from 'react'

const page = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchCategories = async () => {
        const res = await BlogActions.FetchCategory();
        const names = res.data.map((c: any) => c.name);
        setCategories(names);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold">Blog Categories</h1>
                    <p className="text-gray-400 text-sm">
                        Manage your multi-platform content strategy.
                    </p>
                </div>

                <button className='btn' onClick={() => setIsOpen(true)}>
                    + Create Category
                </button>
            </div>
            <div className='glass-card p-6 flex flex-wrap gap-4'>
                {categories.map((c, index) => (
                    <div key={index} className='px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'>
                        {c}
                    </div>
                ))}
            </div>
            {isOpen && (
                <CategoryModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSuccess={fetchCategories}
                />
            )}
        </>
    )
}

export default page