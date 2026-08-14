import { Eye, LayoutGrid, Tag } from "lucide-react";
import { TaxonomyCardProps } from "@/types";

const categoryPalettes = [
    'border-[#e3d4f7] bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]',
    'border-[#b3e5e8] bg-[#e0f7fa] text-[#00838f]',
    'border-[#f8d3bc] bg-[var(--status-amber-bg)] text-[#e37400]',
    'border-[#c7d7f5] bg-[var(--bg-selected)] text-[var(--accent-text)]',
];

const tagPalettes = [
    'border-[#c7d7f5] bg-[var(--bg-selected)] text-[var(--accent-text)]',
    'border-[#e3d4f7] bg-[var(--status-purple-bg)] text-[var(--status-purple-text)]',
    'border-[#b3e5e8] bg-[#e0f7fa] text-[#00838f]',
    'border-[#f8d3bc] bg-[var(--status-amber-bg)] text-[#e37400]',
];

const getChipClassName = (index: number, type: 'category' | 'tag') => {
    const palettes = type === 'category' ? categoryPalettes : tagPalettes;
    return palettes[index % palettes.length];
};

const TaxonomyCard = ({ title, description, items, type, emptyText, onDelete, setShowdata
}: TaxonomyCardProps) => {
    return (
        <section className="rounded-[26px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[18px] border ${type === 'category'
                        ? 'border-[#cdbce6]/30 bg-[var(--status-purple-bg)] text-[#480b8e]'
                        : 'border-[#bce3e6]/30 bg-[#e9f3f6] text-[#107d89]'
                        }`}>
                        {type === 'category' ? <LayoutGrid size={20} /> : <Tag size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)]">{title}</h2>
                            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                                {items.length} items
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
                    </div>
                </div>
            </div>

            {items.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group inline-flex items-center gap-2 md:gap-3 rounded-[10px] md:rounded-[18px] border p-2 md:p-3 lg:px-4 lg:py-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5 ${getChipClassName(index, type)}`}
                        >
                            <div className={`h-9 w-1.5 rounded-full ${type === 'category'
                                ? 'bg-[#a142f4]'
                                : 'bg-[#00838f]'
                                }`} />
                            <span className="text-sm font-medium leading-5">{item.name}</span>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowdata({
                                        data: item,
                                        type: type === 'category' ? 'category' : 'tags',
                                    })
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-[var(--border)] bg-black/20 text-[#2a4a6f] opacity-100 transition hover:border-[var(--status-amber-text)]/40 hover:bg-[var(--status-red-bg)] hover:text-[var(--status-amber-text)] sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label={`Delete ${type} ${item.name}`}
                            >
                                <Eye size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6 rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-5 py-10 text-center">
                    <p className="text-base font-medium text-[var(--text-strong)]">{emptyText}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Create a new {type} to start organizing your content library.
                    </p>
                </div>
            )}
        </section>
    )
};


export default TaxonomyCard;