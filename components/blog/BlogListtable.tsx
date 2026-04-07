import { formatDateTime } from '@/utils/formatDateTime'
import type { BlogListTableType } from '@/types'
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react'
import { getCategoryNames, getPlatformNames, getStatusMeta, getTagNames } from '@/utils/blogHelpers';

const BlogListtable = ({ blogs, platformData, categoryData, tagData, setShowPreview, setSelectedBlog, setSelectUpdate, setDuplicateBlogId, setDeleteBlogId, loading }: BlogListTableType) => {

    const accentThemes = [
        "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
        "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
        "border-[#b8664b]/28 bg-[#b8664b]/16 text-[#ffd7c4]",
        "border-[#354b73]/28 bg-[#354b73]/16 text-[#c8daf9]",
    ];

    return (
        <>
            <div className="hidden overflow-x-auto xl:block">
                {loading ? (
                    <div className="flex min-h-[260px] items-center justify-center px-6 py-10 text-sm text-[#8ea0b8]">
                        Loading blogs...
                    </div>
                ) : (
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[#101826] text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">
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
                                            className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="max-w-[320px]">
                                                    <p className="truncate-4 text-[17px] font-medium text-[#eef4ff]">
                                                        {blog.blog_title}
                                                    </p>
                                                    <p className="mt-3 inline-flex rounded-full border border-[#354b73]/28 bg-[#354b73]/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#c8daf9]">
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
                                                                <span className="rounded-full border border-[#354b73]/28 bg-[#354b73]/14 px-2.5 py-1 text-xs text-[#c8daf9]">
                                                                    +{platformNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[#60738e]">No platform</span>
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
                                                <p className="max-w-[140px] truncate-2 text-sm text-[#dbe5f3]">
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
                                                                <span className="rounded-full border border-[#354b73]/28 bg-[#354b73]/14 px-2.5 py-1 text-xs text-[#c8daf9]">
                                                                    +{categoryNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[#60738e]">Uncategorized</span>
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
                                                                <span className="rounded-full border border-[#354b73]/28 bg-[#354b73]/14 px-2.5 py-1 text-xs text-[#c8daf9]">
                                                                    +{tagNames.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-[#60738e]">No tags</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <p className="max-w-[160px] text-sm text-[#dbe5f3]">
                                                    {blog.updated_at ? formatDateTime(blog.updated_at) : "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7a428f]/24 bg-[#7a428f]/14 text-[#e2c6ff] transition hover:border-[#7a428f]/40 hover:bg-[#7a428f]/22 hover:text-white"
                                                        title="Show Blog"
                                                        onClick={() => {
                                                            setSelectedBlog(blog);
                                                            setShowPreview(true);
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#354b73]/24 bg-[#354b73]/14 text-[#c8daf9] transition hover:border-[#354b73]/40 hover:bg-[#354b73]/22 hover:text-white"
                                                        title="Edit Blog"
                                                        onClick={() => setSelectUpdate(blog.id!)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2f6670]/24 bg-[#2f6670]/14 text-[#b8edf1] transition hover:border-[#2f6670]/40 hover:bg-[#2f6670]/22 hover:text-white"
                                                        title="Duplicate Blog"
                                                        onClick={() => setDuplicateBlogId(blog.id!)}
                                                    >
                                                        <Copy size={15} />
                                                    </button>
                                                    <button
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#b8664b]/24 bg-[#b8664b]/14 text-[#ffd7c4] transition hover:border-[#b8664b]/40 hover:bg-[#b8664b]/22 hover:text-white"
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
                                            <p className="text-lg font-medium text-[#eef4ff]">No blogs found</p>
                                            <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
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
