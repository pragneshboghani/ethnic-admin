'use client';

import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import ClickOutside from '../common/ClickOutside';
import { PlatformResponse } from '../common/TaxonomyModal';

export type Category = {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    created_at?: string;
    platform_ids?: number[];
    status?: string;
}
type ViewDetailsModalProps = {
    showData: {
        data: Category | null;
        type: string;
    };
    setShowdata: Dispatch<SetStateAction<{
        data: Category | null;
        type: string;
    }>>;
    platformData: PlatformResponse | null;
    handleEdit: () => void;
    handleDeleteCategory: (category: Category, type: string) => void;
};

const ViewDetailsModal = ({ showData, setShowdata, platformData, handleEdit, handleDeleteCategory }: ViewDetailsModalProps) => {
    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";

    if (!showData.data) return null;

    const modalTitle = showData.type === 'category' ? 'Category Details' : 'Tag Details';
    const itemLabel = showData.type === 'category' ? 'Category' : 'Tag';
    const linkedPlatforms = showData.data.platform_ids
        ?.map((platformId) => platformData?.data?.find((platform) => platform.id === platformId))
        .filter(Boolean);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 p-4 sm:p-6">
            <ClickOutside onClickOutside={() => setShowdata({ data: null, type: '' })}>
                <div className="relative overflow-y-auto max-h-[88vh] w-full max-w-2xl rounded-[28px] border border-[var(--border)] bg-[var(--bg-inset)] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:p-7">
                    <button
                        type="button"
                        onClick={() => setShowdata({ data: null, type: '' })}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                    >
                        <X size={18} />
                    </button>

                    <div className="pr-12">
                        <p className={labelClassName}>Content Manager</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{modalTitle}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                            Review the saved {itemLabel.toLowerCase()} details, linked platforms, and metadata before making changes.
                        </p>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h3 className="text-lg font-semibold text-[var(--text-strong)]">Basic Details</h3>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Core information currently saved for this {itemLabel.toLowerCase()}.
                                </p>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className={labelClassName}>Name</p>
                                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)]">
                                        {showData.data.name || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Slug</p>
                                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)]">
                                        {showData.data.slug || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <p className={labelClassName}>Description</p>
                                    <div className="min-h-[88px] rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm leading-7 text-[var(--text)]">
                                        {showData.data.description || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Created At</p>
                                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)]">
                                        {showData.data.created_at
                                            ? new Date(showData.data.created_at).toLocaleString()
                                            : '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Status</p>
                                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm capitalize text-[var(--text-strong)]">
                                        {showData.data.status || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                            <div className="border-b border-[var(--border)] pb-4">
                                <h3 className="text-lg font-semibold text-[var(--text-strong)]">Linked Platforms</h3>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Platforms where this {itemLabel.toLowerCase()} is available or intended to be used.
                                </p>
                            </div>

                            <div className="mt-5">
                                {linkedPlatforms && linkedPlatforms.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {linkedPlatforms.map((platform) => (
                                            <span
                                                key={platform!.id}
                                                className="rounded-full border border-[var(--accent)] bg-[var(--bg-inset)] px-3 py-1.5 text-sm text-[var(--text)]"
                                            >
                                                {platform!.platform_name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-4 py-4 text-sm text-[var(--text-muted)]">
                                        No linked platforms found.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                            >
                                Update {itemLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => { handleDeleteCategory(showData.data as Category, showData.type === 'category' ? 'category' : 'tags'); }}
                                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-[#851414] transition hover:border-red-400/35 hover:bg-red-500/15 hover:text-[#8e0b0b]"
                            >
                                Delete {itemLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </ClickOutside>
        </div>
    );
};

export default ViewDetailsModal;
