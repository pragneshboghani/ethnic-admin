'use client';

import CategoryAndTagAction from '@/actions/categoryAndTagAction';
import PlateformActions from '@/actions/PlateFormActions';
import CategoryModal, { PlatformResponse } from '@/components/common/CategoryModal';
import TagModal from '@/components/common/TagModal';
import { Eye, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

type Category = {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    created_at?: string;
    platform_ids?: number[];
    status?: string;
}

type CategoryApiItem = {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    created_at?: string;
    platform_ids?: unknown;
    status?: string;
};

const normalizePlatformIds = (platformIds: unknown): number[] => {
    if (Array.isArray(platformIds)) {
        return platformIds.map(Number).filter((id) => !Number.isNaN(id));
    }

    if (typeof platformIds === 'string') {
        try {
            const parsed = JSON.parse(platformIds);
            return Array.isArray(parsed)
                ? parsed.map(Number).filter((id) => !Number.isNaN(id))
                : [];
        } catch {
            return [];
        }
    }

    return [];
};

const Page = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Category[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenTags, setIsOpenTags] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedTag, setSelectedTag] = useState<Category | null>(null);
    const [platformData, setPlatformData] = useState<PlatformResponse | null>(null);
    const [showData, setShowdata] = useState<{
        data: Category | null;
        type: string;
    }>({
        data: null,
        type: ''
    });

    const fetchCategories = async () => {
        const res = await CategoryAndTagAction.fetchCategory()
        const categoryData: Category[] = res.data.map((c: CategoryApiItem) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            platform_ids: normalizePlatformIds(c.platform_ids),
            slug: c.slug,
            created_at: c.created_at,
            status: c.status,
        }));
        setCategories(categoryData);

        const Res = await CategoryAndTagAction.fetchTags()
        const tagData: Category[] = Res.data.map((c: CategoryApiItem) => ({
            id: c.id,
            name: c.name,
            created_at: c.created_at,
            description: c.description,
            slug: c.slug,
            platform_ids: normalizePlatformIds(c.platform_ids),
            status: c.status,
        }));
        setTags(tagData)
    };

    useEffect(() => {
        queueMicrotask(() => {
            void fetchCategories();
            const fetchPlatforms = async () => {
                const res = await PlateformActions.getAllPlateform();
                setPlatformData(res);
            };
            fetchPlatforms();
        });
    }, []);

    const handleDeleteCategory = async (category: Category, type: string) => {
        if (!category) return null
        if (!confirm(`Are you sure you want to delete ${type} "${category?.name}"?`)) return;
        try {
            setShowdata({ data: null, type: '' });
            await CategoryAndTagAction.deleteCategory(category?.id, type)
            fetchCategories();
            toast.success(`${type} successfully deleted! 🗑️`)
        } catch (error) {
            console.error('Failed to delete category or tag', error);
            alert('Failed to delete category or tag.');
        }
    };

    const handleCategoryModalClose = () => {
        setIsOpen(false);
        setSelectedCategory(null);
    };

    const handleTagModalClose = () => {
        setIsOpenTags(false);
        setSelectedTag(null);
    };

    const handleEdit = () => {
        if (!showData.data) return;

        if (showData.type === 'category') {
            setSelectedCategory(showData.data);
            setIsOpen(true);
        } else {
            setSelectedTag(showData.data);
            setIsOpenTags(true);
        }

        setShowdata({ data: null, type: '' });
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
                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className='relative group px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'
                        >
                            {c.name}
                            <Eye className="absolute top-1 right-1 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => setShowdata({ data: c, type: 'category' })} />
                        </div>
                    ))}
                </div>
            </div>
            <div className='glass-card p-6 flex flex-col gap-4 mt-5'>
                <h2 className='text-lg'>Tags</h2>
                <div className='flex gap-4 flex-wrap'>
                    {tags.map((c) => (
                        <div
                            key={c.id}
                            className='relative group px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/20 text-white shadow-lg border border-white/20 rounded-xl w-fit'
                        >
                            {c.name}
                            <Eye className="absolute top-1 right-1 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => setShowdata({ data: c, type: 'tags' })} />
                        </div>
                    ))}
                </div>
            </div>
            {isOpen && (
                <CategoryModal
                    isOpen={isOpen}
                    onClose={handleCategoryModalClose}
                    onSuccess={fetchCategories}
                    category={selectedCategory}
                />
            )}
            {isOpenTags && (
                <TagModal
                    isOpen={isOpenTags}
                    onClose={handleTagModalClose}
                    onSuccess={fetchCategories}
                    tag={selectedTag}
                />
            )}
            {showData.data !== null && (
                <>
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="p-6 w-[400px] glass-card space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">{showData.type === 'category' ? 'Category Details' : 'Tag Details'}</h2>
                                <button className="text-white" onClick={() => setShowdata({ data: null, type: '' })}>
                                    <X />
                                </button>
                            </div>
                            <p><strong>Name:</strong> {showData.data.name}</p>
                            <p><strong>Description:</strong> {showData.data.description || '-'}</p>
                            <p><strong>Platform:</strong>
                                {showData.data.platform_ids?.map((platform: any) => {
                                    const platformInfo = platformData?.data?.find(p => p.id === platform);
                                    return platformInfo ? (
                                        <span key={platform} className="text-white px-2 py-1 rounded-full text-md mr-1">
                                            {platformInfo.platform_name}
                                        </span>
                                    ) : null;
                                })}</p>
                            <p><strong>Slug:</strong> {showData.data.slug}
                            </p>
                            <p>
                                <strong>Created At:</strong>{' '}
                                {showData.data.created_at
                                    ? new Date(showData.data.created_at).toLocaleString()
                                    : '-'}
                            </p>
                            <div className='flex align-self-end justify-end gap-4'>
                                <button className='btn' onClick={handleEdit}>
                                    Update
                                </button>
                                <button className="btn" onClick={()=>{handleDeleteCategory(showData.data as Category, showData.type === 'category' ? 'category' : 'tags')}}>
                                    Delete {showData.type === 'category' ? 'Category' : 'Tag'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Page
