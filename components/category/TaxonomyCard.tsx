import { Eye, LayoutGrid, Tag } from "lucide-react";
import { TaxonomyCardProps } from "@/types";

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

const TaxonomyCard = ({ title, description, items, type, emptyText, onDelete, setShowdata
}: TaxonomyCardProps) => {
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
                            className={`group inline-flex items-center gap-2 md:gap-3 rounded-[10px] md:rounded-[18px] border p-2 md:p-3 lg:px-4 lg:py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 ${getChipClassName(index, type)}`}
                        >
                            <div className={`h-9 w-1.5 rounded-full ${type === 'category'
                                ? 'bg-[linear-gradient(180deg,#8a5cd0_0%,#d9b8ff_100%)]'
                                : 'bg-[linear-gradient(180deg,#5bbbc2_0%,#bdf7ff_100%)]'
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


export default TaxonomyCard;