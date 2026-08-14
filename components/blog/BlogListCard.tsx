import { BlogListItem, BlogListTableType } from '@/types';
import { getCategoryNames, getPlatformNames, getStatusMeta, getTagNames } from '@/utils/blogHelpers';
import { formatDateTime } from '@/utils/formatDateTime';
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';

const BlogListCard = ({ loading, blogs, platformData, categoryData, tagData, setSelectedBlog,setShowPreview, setDeleteBlogId, setSelectUpdate, setDuplicateBlogId }: BlogListTableType) => {
    return (
        <>
            <div className="space-y-4 p-4 xl:hidden">
                {loading ? (
                    <div className="flex min-h-[260px] items-center justify-center px-2 py-10 text-sm text-[var(--text-muted)]">
                        Loading blogs...
                    </div>
                ) : blogs.length > 0 ? (
                    blogs.map((blog: BlogListItem) => {
                        const platformNames = getPlatformNames(blog.platforms, platformData);
                        const categoryNames = getCategoryNames(blog.category, categoryData);
                        const tagNames = getTagNames(blog.tags, tagData);
                        const statusMeta = getStatusMeta(blog.status ?? "draft");

                        return (
                            <article
                                key={blog.id}
                                className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[17px] font-semibold leading-6 text-[var(--text-strong)]">
                                            {blog.blog_title}
                                        </p>
                                        <p className="mt-2 inline-flex rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--accent-text)]">
                                            Entry #{blog.id}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                                    >
                                        {statusMeta.label}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">Author</p>
                                        <p className="mt-2 text-sm text-[var(--text)]">{blog.author || "Unknown"}</p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">Last Updated</p>
                                        <p className="mt-2 text-sm text-[var(--text)]">
                                            {blog.updated_at ? formatDateTime(blog.updated_at) : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">Platforms</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {platformNames.length > 0 ? (
                                            platformNames.map((platformName, index) => (
                                                <span
                                                    key={`${blog.id}-platform-${platformName}`}
                                                    className={`rounded-full border px-2.5 py-1 text-xs ${[
                                                        "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]",
                                                        "border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--accent-text)]",
                                                        "border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 text-[var(--status-purple-text)]",
                                                    ][index % 3]
                                                        }`}
                                                >
                                                    {platformName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[var(--text-faint)]">No platform</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">Categories</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {categoryNames.length > 0 ? (
                                            categoryNames.map((categoryName) => (
                                                <span
                                                    key={`${blog.id}-category-${categoryName}`}
                                                    className="rounded-full border border-[var(--status-amber-text)]/28 bg-[#f9ab00]/16 px-2.5 py-1 text-xs text-[var(--status-amber-text)]"
                                                >
                                                    {categoryName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[var(--text-faint)]">Uncategorized</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">Tags</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tagNames.length > 0 ? (
                                            tagNames.map((tagName) => (
                                                <span
                                                    key={`${blog.id}-tag-${tagName}`}
                                                    className="rounded-full border border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 px-2.5 py-1 text-xs text-[var(--status-purple-text)]"
                                                >
                                                    {tagName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[var(--text-faint)]">No tags</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--status-purple-text)]/24 bg-[#a142f4]/14 text-[var(--status-purple-text)] transition hover:border-[var(--status-purple-text)]/40 hover:bg-[#a142f4]/22 hover:text-[var(--text-strong)]"
                                        title="Show Blog"
                                        onClick={() => {
                                            setSelectedBlog(blog);
                                            setShowPreview(true);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/24 bg-[var(--accent)]/14 text-[var(--accent-text)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/22 hover:text-[var(--text-strong)]"
                                        title="Edit Blog"
                                        onClick={() => setSelectUpdate(blog.id)}
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--status-green-text)]/24 bg-[#1e8e3e]/14 text-[var(--status-green-text)] transition hover:border-[var(--status-green-text)]/40 hover:bg-[#1e8e3e]/22 hover:text-[var(--text-strong)]"
                                        title="Duplicate Blog"
                                        onClick={() => setDuplicateBlogId(blog.id)}
                                    >
                                        <Copy size={15} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--status-amber-text)]/24 bg-[#f9ab00]/14 text-[var(--status-amber-text)] transition hover:border-[var(--status-amber-text)]/40 hover:bg-[#f9ab00]/22 hover:text-[var(--text-strong)]"
                                        title="Delete Blog"
                                        onClick={() => setDeleteBlogId(blog.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="px-2 py-12 text-center">
                        <p className="text-lg font-medium text-[var(--text-strong)]">No blogs found</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            Try clearing a few filters or create a new blog entry to populate this list.
                        </p>
                    </div>
                )}
            </div>

        </>
    )
}

export default BlogListCard