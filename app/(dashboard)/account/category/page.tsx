'use client';

import CategoryAndTagAction from '@/actions/categoryAndTagAction';
import PlateformActions from '@/actions/PlateFormActions';
import TaxonomyCard from '@/components/category/TaxonomyCard';
import ViewDetailsModal, { Category } from '@/components/category/ViewDetailsModal';
import TaxonomyModal, { PlatformResponse } from '@/components/common/TaxonomyModal';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StatCard } from '../plateforms/page';

export type TaxonomyItem = {
    id: number;
    name: string;
    description?: string;
    platform_ids?: number[];
    slug?: string;
    created_at?: string;
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
            const categoryData: TaxonomyItem[] = categoryResponse.data.map((category: {
                id: number;
                name: string;
                description?: string;
                platform_ids?: unknown;
                slug?: string;
                created_at?: string;
                status?: string;
            }) => ({
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
            const tagData: TaxonomyItem[] = tagResponse.data.map((tag: {
                id: number;
                name: string;
                description?: string;
                platform_ids?: unknown;
                slug?: string;
                created_at?: string;
                status?: string;
            }) => ({
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
        const fetchPlatforms = async () => {
            await fetchCategories();
            const res = await PlateformActions.getAllPlateform();
            setPlatformData(res);
        };

        void fetchPlatforms();
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
            <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label="Categories"
                    value={categories.length}
                    note="Primary content groupings across platforms"
                    tone="bg-[var(--status-purple-bg)]"
                    progress={(categories.length / totalTerms) * 100}
                />
                <StatCard
                    label="Tags"
                    value={tags.length}
                    note="Keyword-level labels for discovery and filtering"
                    tone="bg-[#e0f2f1]"
                    progress={(tags.length / totalTerms) * 100}
                />
                <StatCard
                    label="Taxonomy terms"
                    value={totalTerms}
                    note="Total reusable structure items in this workspace"
                    tone="bg-[var(--status-red-bg)]"
                    progress={100}
                />
            </section>
            <aside className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex gap-5 flex-wrap justify-between shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        Quick Actions
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
                        Shape your content structure
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        Create reusable categories and tags so blog organization stays clean across all publishing destinations.
                    </p>
                </div>

                <div className="gap-3 flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
                    >
                        <Plus size={16} />
                        Create Category
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpenTags(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    >
                        <Plus size={16} />
                        Create Tag
                    </button>
                </div>
            </aside>

            <section className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--text-muted)]">
                            Taxonomy Library
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
                            Browse and refine your labels
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            Search through categories and tags to find the exact term you want to manage.
                        </p>
                    </div>

                    <div className="lg:w-[360px]">
                        <label className="relative block">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search categories or tags..."
                                className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--bg-inset)] py-3 pl-11 pr-4 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none"
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
                <TaxonomyModal
                    isOpen={isOpen}
                    onClose={() => {
                        setIsOpen(false);
                        setSelectedCategory(null);
                    }}
                    onSuccess={fetchCategories}
                    type="category"
                    entity={selectedCategory}
                />
            )}

            {isOpenTags && (
                <TaxonomyModal
                    isOpen={isOpenTags}
                    onClose={() => {
                        setIsOpenTags(false);
                        setSelectedTag(null);
                    }}
                    onSuccess={fetchCategories}
                    type="tag"
                    entity={selectedTag}
                />
            )}

            {showData.data !== null && (
                <ViewDetailsModal showData={showData} setShowdata={setShowdata} handleEdit={handleEdit} platformData={platformData} handleDeleteCategory={handleDeleteCategory} />
            )}
        </>
    );
};

export default Page;
