'use client';

import CategoryAndTagAction from '@/actions/categoryAndTagAction';
import PlateformActions from '@/actions/PlateFormActions';
import TaxonomyCard from '@/components/category/TaxonomyCard';
import ViewDetailsModal, { Category } from '@/components/category/ViewDetailsModal';
import CategoryModal, { PlatformResponse } from '@/components/common/CategoryModal';
import TagModal from '@/components/common/TagModal';
import { StatCardProps } from '@/types';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { set } from 'zod';

export type TaxonomyItem = {
    id: number;
    name: string;
};

const StatCard = ({ label, value, note, tone, }: StatCardProps) => (
    <div className={`rounded-[24px] border border-white/8 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] ${tone}`}>
        <p className="text-sm font-medium text-white/78">{label}</p>
        <p className="mt-4 text-4xl font-semibold leading-none text-white">{value}</p>
        <p className="mt-4 text-sm text-white/74">{note}</p>
        <div className="mt-4 h-1.5 rounded-full bg-black/12">
            <div className="h-full w-2/3 rounded-full bg-white/90" />
        </div>
    </div>
);

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
    const [categories, setCategories] = useState<TaxonomyItem[]>([]);
    const [tags, setTags] = useState<TaxonomyItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenTags, setIsOpenTags] = useState(false);
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
        try {
            const categoryResponse = await CategoryAndTagAction.fetchCategory();
            const categoryData: TaxonomyItem[] = categoryResponse.data.map((category: any) => ({
                id: category.id,
                name: category.name,
                description: category.description,
                platform_ids: normalizePlatformIds(category.platform_ids),
                slug: category.slug,
                created_at: category.created_at,
                status: category.status,
            }));
            setCategories(categoryData);

            const tagResponse = await CategoryAndTagAction.fetchTags();
            const tagData: TaxonomyItem[] = tagResponse.data.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                description: tag.description,
                platform_ids: normalizePlatformIds(tag.platform_ids),
                slug: tag.slug,
                created_at: tag.created_at,
                status: tag.status,
            }));
            setTags(tagData);
        } catch (error) {
            console.error('Failed to load categories and tags', error);
            toast.error('Failed to load categories and tags 😢');
        }
    };

    useEffect(() => {
        fetchCategories();
        const fetchPlatforms = async () => {
            const res = await PlateformActions.getAllPlateform();
            setPlatformData(res);
        };
        fetchPlatforms();
    }, []);

    const handleDeleteCategory = async (item: TaxonomyItem, type: string) => {
        if (!item) return;
        if (!confirm(`Are you sure you want to delete ${type} "${item.name}"?`)) return;

        try {
            await CategoryAndTagAction.deleteCategory(item.id, type);
            fetchCategories();
            setShowdata({ data: null, type: '' });
            toast.success(`${type === 'category' ? 'Category' : 'Tag'} successfully deleted!`);
        } catch (error) {
            console.error('Failed to delete category or tag', error);
            toast.error('Failed to delete category or tag 😢');
        }
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredCategories = categories.filter((item) =>
        item.name.toLowerCase().includes(normalizedQuery)
    );
    const filteredTags = tags.filter((item) =>
        item.name.toLowerCase().includes(normalizedQuery)
    );
    const totalTerms = categories.length + tags.length;

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
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Categories"
                        value={categories.length}
                        note="Primary content groupings across platforms"
                        tone="bg-[linear-gradient(180deg,#6f458a_0%,#6a4185_100%)]"
                    />
                    <StatCard
                        label="Tags"
                        value={tags.length}
                        note="Keyword-level labels for discovery and filtering"
                        tone="bg-[linear-gradient(180deg,#3f7d87_0%,#3a7580_100%)]"
                    />
                    <StatCard
                        label="Taxonomy terms"
                        value={totalTerms}
                        note="Total reusable structure items in this workspace"
                        tone="bg-[linear-gradient(180deg,#bd6d4f_0%,#b8664b_100%)]"
                    />
                </div>

                <aside className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">
                        Quick Actions
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#eef4ff]">
                        Shape your content structure
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                        Create reusable categories and tags so blog organization stays clean across all publishing destinations.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                        >
                            <Plus size={16} />
                            Create Category
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpenTags(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-[#101826] px-4 py-3 text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e] hover:bg-[#182438]"
                        >
                            <Plus size={16} />
                            Create Tag
                        </button>
                    </div>
                </aside>
            </section>

            <section className="mt-6 rounded-[26px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">
                            Taxonomy Library
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#eef4ff]">
                            Browse and refine your labels
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                            Search through categories and tags to find the exact term you want to manage.
                        </p>
                    </div>

                    <div className="lg:w-[360px]">
                        <label className="relative block">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8096]"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search categories or tags..."
                                className="w-full rounded-[16px] border border-white/8 bg-[#101826] py-3 pl-11 pr-4 text-sm text-[#eef4ff] placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                            />
                        </label>
                    </div>
                </div>
            </section>

            <div className="mt-6 space-y-6">
                <TaxonomyCard
                    title="Categories"
                    description="Top-level content buckets for organizing your publishing workflow and platform-specific taxonomy."
                    items={filteredCategories}
                    type="category"
                    emptyText={normalizedQuery ? 'No categories match your search.' : 'No categories added yet.'}
                    onDelete={handleDeleteCategory}
                    setShowdata={setShowdata}
                />

                <TaxonomyCard
                    title="Tags"
                    description="Flexible topic labels that make blogs easier to filter, reuse, and distribute across connected channels."
                    items={filteredTags}
                    type="tag"
                    emptyText={normalizedQuery ? 'No tags match your search.' : 'No tags added yet.'}
                    onDelete={handleDeleteCategory}
                    setShowdata={setShowdata}
                />
            </div>

            {isOpen && (
                <CategoryModal
                    isOpen={isOpen}
                    onClose={() => {
                        setIsOpen(false);
                        setSelectedCategory(null);
                    }}
                    onSuccess={fetchCategories}
                    category={selectedCategory}
                />
            )}

            {isOpenTags && (
                <TagModal
                    isOpen={isOpenTags}
                    onClose={() => {
                        setIsOpenTags(false);
                        setSelectedTag(null);
                    }}
                    onSuccess={fetchCategories}
                    tag={selectedTag}
                />
            )}

            {showData.data !== null && (
                <ViewDetailsModal showData={showData} setShowdata={setShowdata} handleEdit={handleEdit} platformData={platformData} handleDeleteCategory={handleDeleteCategory} />
            )}
        </>
    );
};

export default Page;