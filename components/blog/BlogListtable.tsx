import { formatDateTime } from '@/utils/formatDateTime'
import type { BlogListTableType } from '@/types'
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react'
import { getCategoryNames, getPlatformNames, getStatusMeta, getTagNames } from '@/utils/blogHelpers';

const BlogListtable = ({ blogs, platformData, categoryData, tagData, setShowPreview, setSelectedBlog, setSelectUpdate, setDuplicateBlogId, setDeleteBlogId, loading }: BlogListTableType) => {

    const accentThemes = [
        "border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 text-[var(--status-purple-text)]",
        "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]",
        "border-[var(--status-amber-text)]/28 bg-[#f9ab00]/16 text-[var(--status-amber-text)]",
        "border-[var(--accent)]/28 bg-[var(--accent)]/16 text-[var(--accent-text)]",
    ];

    return (
        <>
            <div className="hidden overflow-x-auto xl:block">
                {loading ? (
                    <div className="flex min-h-[260px] items-center justify-center px-6 py-10 text-sm text-[var(--text-muted)]">
                        Loading blogs...
                    </div>
                ) : (
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[var(--bg-inset)] text-[11px] uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Blog Title</th>
                                <th className="px-5 py-4 font-medium">Platform</th>
                                <th className="px-5 py-4 font-medium">Status</th>
                                <th className="px-5 py-4 font-medium">Author</th>
                                <th className="px-5 py-4 font-medium">Category</th>
                                <th className="px-5 py-4 font-medium">Tags</th>
                                <th className="px-5 py-4 font-medium">Last Updated</th>
                                <th className="px-5 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length > 0 ? (
                                blogs.map((blog) => {
                                    const platformNames = getPlatformNames(blog.platforms, platformData);
                                    const categoryNames = getCategoryNames(blog.category, categoryData);
                                    const tagNames = getTagNames(blog.tags, tagData);
                                    const statusMeta = getStatusMeta(blog.status ?? "draft");

                                    return (
                                        <tr
                                            key={blog.id}
                                            className="border-t border-[var(--border)] align-top transition hover:bg-black/[0.03]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="max-w-[320px]">
                                                    <p className="truncate-4 text-[17px] font-medium text-[var(--text-strong)]">
                                                        {blog.blog_title}
                                                    </p>
                                                    <p className="mt-3 inline-flex rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--accent-text)]">
                                                        Entry #{blog.id}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex max-w-[180px] flex-wrap gap-2">
                                                    {platformNames.length > 0 ? (
                                                        <>
                                                            {platformNames.slice(0, 2).map((platformName, index) => (
                                                                <span
                                                                    key={`${blog.id}-${platformName}`}
                                                                    className={`rounded-full border px-2.5 py-1 text-xs ${accentThemes[(index + 1) % accentThemes.length]}`}
                                                                >
                                                                    {platformName}
                                                                </span>
                                                            ))}
                                                            {platformNames.length > 2 && (
                                                                <span className="rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-2.5 py-1 text-xs text-[var(--accent-text)]">
                                                                    +{platformNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text-faint)]">No platform</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                            </td>

                                            <td className="px-5 py-5">
                                                <p className="max-w-[140px] truncate-2 text-sm text-[var(--text)]">
                                                    {blog.author || "Unknown"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex max-w-[200px] flex-wrap gap-2">
                                                    {categoryNames.length > 0 ? (
                                                        <>
                                                            {categoryNames.slice(0, 2).map((categoryName, index) => (
                                                                <span
                                                                    key={`${blog.id}-${categoryName}`}
                                                                    className={`rounded-full border px-2.5 py-1 text-xs ${accentThemes[(index + 2) % accentThemes.length]}`}
                                                                >
                                                                    {categoryName}
                                                                </span>
                                                            ))}
                                                            {categoryNames.length > 2 && (
                                                                <span className="rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-2.5 py-1 text-xs text-[var(--accent-text)]">
                                                                    +{categoryNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text-faint)]">Uncategorized</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex max-w-[200px] flex-wrap gap-2">
                                                    {tagNames.length > 0 ? (
                                                        <>
                                                            {tagNames.slice(0, 2).map((tagName, index) => (
                                                                <span
                                                                    key={`${blog.id}-${tagName}`}
                                                                    className={`rounded-full border px-2.5 py-1 text-xs ${accentThemes[(index + 3) % accentThemes.length]}`}
                                                                >
                                                                    {tagName}
                                                                </span>
                                                            ))}
                                                            {tagNames.length > 2 && (
                                                                <span className="rounded-full border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-2.5 py-1 text-xs text-[var(--accent-text)]">
                                                                    +{tagNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text-faint)]">No tags</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <p className="max-w-[160px] text-sm text-[var(--text)]">
                                                    {blog.updated_at ? formatDateTime(blog.updated_at) : "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--status-purple-text)]/24 bg-[#a142f4]/14 text-[var(--status-purple-text)] transition hover:border-[var(--status-purple-text)]/40 hover:bg-[#a142f4]/22 hover:text-[var(--text-strong)]"
                                                        title="Show Blog"
                                                        onClick={() => {
                                                            setSelectedBlog(blog);
                                                            setShowPreview(true);
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent)]/24 bg-[var(--accent)]/14 text-[var(--accent-text)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/22 hover:text-[var(--text-strong)]"
                                                        title="Edit Blog"
                                                        onClick={() => setSelectUpdate(blog.id!)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--status-green-text)]/24 bg-[#1e8e3e]/14 text-[var(--status-green-text)] transition hover:border-[var(--status-green-text)]/40 hover:bg-[#1e8e3e]/22 hover:text-[var(--text-strong)]"
                                                        title="Duplicate Blog"
                                                        onClick={() => setDuplicateBlogId(blog.id!)}
                                                    >
                                                        <Copy size={15} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--status-amber-text)]/24 bg-[#f9ab00]/14 text-[var(--status-amber-text)] transition hover:border-[var(--status-amber-text)]/40 hover:bg-[#f9ab00]/22 hover:text-[var(--text-strong)]"
                                                        title="Delete Blog"
                                                        onClick={() => setDeleteBlogId(blog.id!)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="mx-auto max-w-sm">
                                            <p className="text-lg font-medium text-[var(--text-strong)]">No blogs found</p>
                                            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                                                Try clearing a few filters or create a new blog entry to populate this list.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    )
}

export default BlogListtable
