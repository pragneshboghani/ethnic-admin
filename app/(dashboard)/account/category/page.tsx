'use client';

import CategoryAndTagAction from '@/actions/categoryAndTagAction';
import PlateformActions from '@/actions/PlateFormActions';
import ViewDetailsModal, { Category } from '@/components/category/ViewDetailsModal';
import CategoryModal, { PlatformResponse } from '@/components/common/CategoryModal';
import TagModal from '@/components/common/TagModal';
import { LayoutGrid, Plus, Search, Tag, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { set } from 'zod';

type TaxonomyItem = {
    id: number;
    name: string;
};

const categoryPalettes = [
    'border-[#8a5cd0]/25 bg-[linear-gradient(180deg,rgba(122,74,158,0.24)_0%,rgba(21,29,44,0.96)_100%)] text-[#f4ecff]',
    'border-[#5fbcc7]/25 bg-[linear-gradient(180deg,rgba(55,118,126,0.24)_0%,rgba(21,29,44,0.96)_100%)] text-[#e6fbff]',
    'border-[#d07a59]/25 bg-[linear-gradient(180deg,rgba(166,96,62,0.24)_0%,rgba(21,29,44,0.96)_100%)] text-[#fff1eb]',
    'border-[#5373ac]/25 bg-[linear-gradient(180deg,rgba(60,89,140,0.24)_0%,rgba(21,29,44,0.96)_100%)] text-[#e8efff]',
];

const tagPalettes = [
    'border-[#4c6fff]/25 bg-[linear-gradient(180deg,rgba(62,94,155,0.2)_0%,rgba(21,29,44,0.94)_100%)] text-[#edf3ff]',
    'border-[#9b5fd3]/25 bg-[linear-gradient(180deg,rgba(113,68,148,0.2)_0%,rgba(21,29,44,0.94)_100%)] text-[#f6eeff]',
    'border-[#5bbbc2]/25 bg-[linear-gradient(180deg,rgba(53,113,118,0.2)_0%,rgba(21,29,44,0.94)_100%)] text-[#e8fdff]',
    'border-[#d59654]/25 bg-[linear-gradient(180deg,rgba(132,93,49,0.2)_0%,rgba(21,29,44,0.94)_100%)] text-[#fff4e7]',
];

const getChipClassName = (index: number, type: 'category' | 'tag') => {
    const palettes = type === 'category' ? categoryPalettes : tagPalettes;
    return palettes[index % palettes.length];
};

const StatCard = ({
    label,
    value,
    note,
    tone,
}: {
    label: string;
    value: number;
    note: string;
    tone: string;
}) => (
    <div className={`rounded-[24px] border border-white/8 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] ${tone}`}>
        <p className="text-sm font-medium text-white/78">{label}</p>
        <p className="mt-4 text-4xl font-semibold leading-none text-white">{value}</p>
        <p className="mt-4 text-sm text-white/74">{note}</p>
        <div className="mt-4 h-1.5 rounded-full bg-black/12">
            <div className="h-full w-2/3 rounded-full bg-white/90" />
        </div>
    </div>
);

const TaxonomyCard = ({
    title,
    description,
    items,
    type,
    emptyText,
    onDelete,
    setShowdata
}: {
    title: string;
    description: string;
    items: TaxonomyItem[];
    type: 'category' | 'tag';
    emptyText: string;
    onDelete: (item: TaxonomyItem, type: string) => void;
    setShowdata: (data: { data: Category | null; type: string }) => void;
}) => {
    return (
        <section className="rounded-[26px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[18px] border ${type === 'category'
                        ? 'border-[#8a5cd0]/30 bg-[#2d223f] text-[#d9b8ff]'
                        : 'border-[#5bbbc2]/30 bg-[#1b3640] text-[#a8edf5]'
                        }`}>
                        {type === 'category' ? <LayoutGrid size={20} /> : <Tag size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold tracking-tight text-[#eef4ff]">{title}</h2>
                            <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs font-medium text-[#8ea0b8]">
                                {items.length} items
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">{description}</p>
                    </div>
                </div>
            </div>

            {items.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group inline-flex items-center gap-3 rounded-[18px] border px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 ${getChipClassName(index, type)}`}
                        >
                            <div className={`h-9 w-1.5 rounded-full ${type === 'category'
                                ? 'bg-[linear-gradient(180deg,#8a5cd0_0%,#d9b8ff_100%)]'
                                : 'bg-[linear-gradient(180deg,#5bbbc2_0%,#bdf7ff_100%)]'
                                }`} />
                            <span className="text-sm font-medium leading-5">{item.name}</span>
                            <button
                                type="button"
                                // onClick={() => onDelete(item, type === 'category' ? 'category' : 'tags')}
                                onClick={() =>
                                    setShowdata({
                                        data: item,
                                        type: type === 'category' ? 'category' : 'tags',
                                    })
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-black/20 text-[#b9c9db] opacity-100 transition hover:border-[#b8664b]/40 hover:bg-[#372423] hover:text-[#ffd7c4] sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label={`Delete ${type} ${item.name}`}
                            >
                                <Eye size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6 rounded-[22px] border border-dashed border-white/10 bg-[#101826] px-5 py-10 text-center">
                    <p className="text-base font-medium text-[#eef4ff]">{emptyText}</p>
                    <p className="mt-2 text-sm text-[#8ea0b8]">
                        Create a new {type} to start organizing your content library.
                    </p>
                </div>
            )}
        </section>
    )
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