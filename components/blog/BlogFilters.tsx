"use client";

import { BlogFiltersProps } from "@/types";
import { Search, SlidersHorizontal } from "lucide-react";

const BlogFilters = ({ loading, blogs, draftBlogs, search, setSearch, author, setAuthor, category, setCategory, categoryData, tags, setTags, tagData, platform, setPlatform, platformData, status, setStatus, sort, setSort, }: BlogFiltersProps) => {
    return (
        <section className="mt-6 rounded-[24px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#7a428f]/24 bg-[#7a428f]/14 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#e2c6ff]">
                        <SlidersHorizontal size={14} />
                        Filters
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-[#eef4ff]">Refine blog results</h2>
                    <p className="mt-1 text-sm text-[#8ea0b8]">
                        Search by title, author, taxonomy, platform, or publish state.
                    </p>
                </div>

                <div className="inline-flex items-center rounded-full border border-[#354b73]/24 bg-[#354b73]/14 px-4 py-2 text-sm text-[#c8daf9]">
                    {loading
                        ? "Refreshing results..."
                        : `${blogs.length} result${blogs.length === 1 ? "" : "s"} • ${draftBlogs} draft${draftBlogs === 1 ? "" : "s"}`}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
                <div className="relative">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#60738e]"
                    />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] pl-11 pr-4 text-sm text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <input
                    type="text"
                    placeholder="Author"
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />

                <select
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white focus:border-[#31425e] focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categoryData?.data?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white focus:border-[#31425e] focus:outline-none"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                >
                    <option value="">All Tags</option>
                    {tagData?.data?.map((tag: any) => (
                        <option key={tag.id} value={tag.id}>
                            {tag.name}
                        </option>
                    ))}
                </select>

                {platformData?.totalPlatforms > 0 && (
                    <select
                        className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white focus:border-[#31425e] focus:outline-none"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    >
                        <option value="0">All Platforms</option>
                        {platformData.data.map((item: any) => (
                            <option key={item.id} value={item.id}>
                                {item.platform_name}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white focus:border-[#31425e] focus:outline-none"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                    <option value="future">Scheduled</option>
                </select>

                <select
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#101826] px-4 text-sm text-white focus:border-[#31425e] focus:outline-none"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="none">Sort By Create Date</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </section>
    );
};

export default BlogFilters;