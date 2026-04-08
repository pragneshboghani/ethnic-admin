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
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

    if (!showData.data) return null;

    const modalTitle = showData.type === 'category' ? 'Category Details' : 'Tag Details';
    const itemLabel = showData.type === 'category' ? 'Category' : 'Tag';
    const linkedPlatforms = showData.data.platform_ids
        ?.map((platformId) => platformData?.data?.find((platform) => platform.id === platformId))
        .filter(Boolean);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
            <ClickOutside onClickOutside={() => setShowdata({ data: null, type: '' })}>
                <div className="relative overflow-y-auto max-h-[88vh] w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#101826] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-7">
                    <button
                        type="button"
                        onClick={() => setShowdata({ data: null, type: '' })}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#151d2c] text-[#dbe5f3] transition hover:border-[#31425e] hover:bg-[#182438]"
                    >
                        <X size={18} />
                    </button>

                    <div className="pr-12">
                        <p className={labelClassName}>Content Manager</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#eef4ff]">{modalTitle}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#8ea0b8]">
                            Review the saved {itemLabel.toLowerCase()} details, linked platforms, and metadata before making changes.
                        </p>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                            <div className="border-b border-white/8 pb-4">
                                <h3 className="text-lg font-semibold text-[#eef4ff]">Basic Details</h3>
                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Core information currently saved for this {itemLabel.toLowerCase()}.
                                </p>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className={labelClassName}>Name</p>
                                    <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff]">
                                        {showData.data.name || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Slug</p>
                                    <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff]">
                                        {showData.data.slug || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <p className={labelClassName}>Description</p>
                                    <div className="min-h-[88px] rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm leading-7 text-[#dbe5f3]">
                                        {showData.data.description || '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Created At</p>
                                    <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff]">
                                        {showData.data.created_at
                                            ? new Date(showData.data.created_at).toLocaleString()
                                            : '-'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={labelClassName}>Status</p>
                                    <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm capitalize text-[#eef4ff]">
                                        {showData.data.status || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                            <div className="border-b border-white/8 pb-4">
                                <h3 className="text-lg font-semibold text-[#eef4ff]">Linked Platforms</h3>
                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Platforms where this {itemLabel.toLowerCase()} is available or intended to be used.
                                </p>
                            </div>

                            <div className="mt-5">
                                {linkedPlatforms && linkedPlatforms.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {linkedPlatforms.map((platform) => (
                                            <span
                                                key={platform!.id}
                                                className="rounded-full border border-[#31425e] bg-[#101826] px-3 py-1.5 text-sm text-[#dbe5f3]"
                                            >
                                                {platform!.platform_name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[18px] border border-dashed border-white/10 bg-[#101826] px-4 py-4 text-sm text-[#8ea0b8]">
                                        No linked platforms found.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="rounded-xl border border-white/10 bg-[#151d2c] px-4 py-2.5 text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e] hover:bg-[#182438]"
                            >
                                Update {itemLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => { handleDeleteCategory(showData.data as Category, showData.type === 'category' ? 'category' : 'tags'); }}
                                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-[#f6c4c4] transition hover:border-red-400/35 hover:bg-red-500/15 hover:text-[#ffd7d7]"
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
