import { BlogListItem, BlogListTableType } from '@/types';
import { getCategoryNames, getPlatformNames, getStatusMeta, getTagNames } from '@/utils/blogHelpers';
import { formatDateTime } from '@/utils/formatDateTime';
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';

const BlogListCard = ({ loading, blogs, platformData, categoryData, tagData, setSelectedBlog,setShowPreview, setDeleteBlogId, setSelectUpdate, setDuplicateBlogId }: BlogListTableType) => {
    return (
        <>
            <div className="space-y-4 p-4 xl:hidden">
                {loading ? (
                    <div className="flex min-h-[260px] items-center justify-center px-2 py-10 text-sm text-[#8ea0b8]">
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
                                className="rounded-[22px] border border-white/8 bg-[#101826] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[17px] font-semibold leading-6 text-[#eef4ff]">
                                            {blog.blog_title}
                                        </p>
                                        <p className="mt-2 inline-flex rounded-full border border-[#354b73]/28 bg-[#354b73]/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#c8daf9]">
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
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">Author</p>
                                        <p className="mt-2 text-sm text-[#dbe5f3]">{blog.author || "Unknown"}</p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">Last Updated</p>
                                        <p className="mt-2 text-sm text-[#dbe5f3]">
                                            {blog.updated_at ? formatDateTime(blog.updated_at) : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">Platforms</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {platformNames.length > 0 ? (
                                            platformNames.map((platformName, index) => (
                                                <span
                                                    key={`${blog.id}-platform-${platformName}`}
                                                    className={`rounded-full border px-2.5 py-1 text-xs ${[
                                                        "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
                                                        "border-[#354b73]/28 bg-[#354b73]/16 text-[#c8daf9]",
                                                        "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
                                                    ][index % 3]
                                                        }`}
                                                >
                                                    {platformName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[#60738e]">No platform</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">Categories</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {categoryNames.length > 0 ? (
                                            categoryNames.map((categoryName) => (
                                                <span
                                                    key={`${blog.id}-category-${categoryName}`}
                                                    className="rounded-full border border-[#b8664b]/28 bg-[#b8664b]/16 px-2.5 py-1 text-xs text-[#ffd7c4]"
                                                >
                                                    {categoryName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[#60738e]">Uncategorized</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f90a8]">Tags</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tagNames.length > 0 ? (
                                            tagNames.map((tagName) => (
                                                <span
                                                    key={`${blog.id}-tag-${tagName}`}
                                                    className="rounded-full border border-[#7a428f]/28 bg-[#7a428f]/16 px-2.5 py-1 text-xs text-[#e2c6ff]"
                                                >
                                                    {tagName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[#60738e]">No tags</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7a428f]/24 bg-[#7a428f]/14 text-[#e2c6ff] transition hover:border-[#7a428f]/40 hover:bg-[#7a428f]/22 hover:text-white"
                                        title="Show Blog"
                                        onClick={() => {
                                            setSelectedBlog(blog);
                                            setShowPreview(true);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#354b73]/24 bg-[#354b73]/14 text-[#c8daf9] transition hover:border-[#354b73]/40 hover:bg-[#354b73]/22 hover:text-white"
                                        title="Edit Blog"
                                        onClick={() => setSelectUpdate(blog.id)}
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2f6670]/24 bg-[#2f6670]/14 text-[#b8edf1] transition hover:border-[#2f6670]/40 hover:bg-[#2f6670]/22 hover:text-white"
                                        title="Duplicate Blog"
                                        onClick={() => setDuplicateBlogId(blog.id)}
                                    >
                                        <Copy size={15} />
                                    </button>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#b8664b]/24 bg-[#b8664b]/14 text-[#ffd7c4] transition hover:border-[#b8664b]/40 hover:bg-[#b8664b]/22 hover:text-white"
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
                        <p className="text-lg font-medium text-[#eef4ff]">No blogs found</p>
                        <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                            Try clearing a few filters or create a new blog entry to populate this list.
                        </p>
                    </div>
                )}
            </div>

        </>
    )
}

export default BlogListCard