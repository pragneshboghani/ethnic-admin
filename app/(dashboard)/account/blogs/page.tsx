"use client";

import BlogActions from "@/actions/BlogAction";
import DashBoardActions from "@/actions/DashboardAction";
import SEOActions from "@/actions/SEOAction";
import BlogPreviewModal from "@/components/blog/BlogPreviewModal";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileText,
  Globe2,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Blogs = () => {
  const router = useRouter();
  const [platformData, setPlatformData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [tagData, setTagData] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectUpdate, setSelectUpdate] = useState<number | null>(null);
  const [duplicateBlogId, setDuplicateBlogId] = useState<number | null>(null);
  const [platformSettings, setPlatformSettings] = useState<any>({});

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("0");
  const [status, setStatus] = useState("all");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await DashBoardActions.getAllData();

        setBlogs(res.blogData || []);
        setPlatformData({
          data: res.plateformData,
          totalPlatforms: res.plateformData?.length,
        });
        setCategoryData({ data: res.categoryData });
        setTagData({ data: res.tagsData });

      } catch (err) {
        console.error("Error fetching all data:", err);
      }
    };

    fetchAll();
  }, []);
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await BlogActions.getFilteredBlogs({
        platform,
        status,
        search,
        author,
        category,
        tags,
      });
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [platform, status, search, tags, category, author]);

  const handleDelete = async (id: number) => {
    try {
      await BlogActions.deleteBlog(id);
      await SEOActions.deleteSEO(id);

      toast.success("Blog successfully deleted! 🗑️");
      fetchBlogs();

    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete Blog 😢");
    }
  };

  useEffect(() => {
    if (selectUpdate) {
      router.push(`/account/blogs/add?id=${selectUpdate}`);
    }
  }, [selectUpdate, router]);

  useEffect(() => {
    if (duplicateBlogId) {
      router.push(`/account/blogs/add?duplicateId=${duplicateBlogId}`);
    }
  }, [duplicateBlogId, router]);

  useEffect(() => {
    const fetchPlatformSettings = async (blog: any) => {
      if (!blog) return;

      try {
        const results: any = {};

        await Promise.all(
          blog.platforms.map(async (platformId: number) => {
            try {
              const res = await SEOActions.GetByBlogsAndPlatform(
                blog.id,
                platformId
              );

              if (res?.data?.length > 0) {
                const seo = res.data[0];

                results[platformId] = {
                  slug: seo.slug,
                  publishStatus: seo.publish_status,
                  seoTitle: seo.seo_title,
                  metaDescription: seo.meta_description,
                  canonicalUrl: seo.canonical_url,
                  ctaButtonText: seo.cta_button_text,
                  ctaButtonLink: seo.cta_button_link,
                };
              }
            } catch (err) {
              console.error("Error fetching platform setting", err);
            }
          })
        );

        setPlatformSettings(results);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchPlatformSettings(selectedBlog);
  }, [selectedBlog]);

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((blog) => blog.status === "publish").length;
  const draftBlogs = blogs.filter((blog) => blog.status === "draft").length;
  const scheduledBlogs = blogs.filter((blog) => blog.status === "future").length;
  const clampProgress = (value: number) => Math.max(22, Math.min(96, value));
  const publishedProgress = totalBlogs > 0 ? (publishedBlogs / totalBlogs) * 100 : 26;
  const scheduledProgress = totalBlogs > 0 ? (scheduledBlogs / totalBlogs) * 100 : 22;
  const platformProgress = (platformData?.totalPlatforms ?? 0) * 24 + 18;
  const accentThemes = [
    "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
    "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
    "border-[#b8664b]/28 bg-[#b8664b]/16 text-[#ffd7c4]",
    "border-[#354b73]/28 bg-[#354b73]/16 text-[#c8daf9]",
  ];

  const summaryCards = [
    {
      label: "Total blogs",
      value: totalBlogs,
      description: "Content entries in the current view",
      icon: FileText,
      cardClassName: "bg-[#5d366f] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#24152f] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: clampProgress(totalBlogs * 12 + 18),
    },
    {
      label: "Published",
      value: publishedBlogs,
      description: "Posts already live on platforms",
      icon: CheckCircle2,
      cardClassName: "bg-[#2f6670] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#16333c] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: clampProgress(publishedProgress),
    },
    {
      label: "Scheduled",
      value: scheduledBlogs,
      description: "Posts waiting for publish time",
      icon: Clock3,
      cardClassName: "bg-[#b8664b] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#4a2a20] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: clampProgress(scheduledProgress),
    },
    {
      label: "Platforms",
      value: platformData?.totalPlatforms ?? 0,
      description: "Connected publishing destinations",
      icon: Globe2,
      cardClassName: "bg-[#354b73] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#1c2b45] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: clampProgress(platformProgress),
    },
  ];

  const getPlatformNames = (platformIds: number[] = []) =>
    Array.isArray(platformIds)
      ? platformIds
          .map((platformId) => {
            const selectedPlatform = platformData?.data?.find(
              (item: any) => item.id === platformId,
            );
            return selectedPlatform?.platform_name || null;
          })
          .filter(Boolean)
      : [];

  const getCategoryNames = (categoryIds: number[] = []) =>
    Array.isArray(categoryIds)
      ? categoryIds
          .map((categoryId) => {
            const selectedCategory = categoryData?.data?.find(
              (item: any) => item.id === categoryId,
            );
            return selectedCategory?.name || null;
          })
          .filter(Boolean)
      : [];

  const getTagNames = (tagIds: number[] = []) =>
    Array.isArray(tagIds)
      ? tagIds
          .map((tagId) => {
            const selectedTag = tagData?.data?.find((item: any) => item.id === tagId);
            return selectedTag?.name || null;
          })
          .filter(Boolean)
      : [];

  const getStatusMeta = (blogStatus: string) => {
    if (blogStatus === "publish") {
      return {
        label: "Published",
        className: "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
      };
    }

    if (blogStatus === "future") {
      return {
        label: "Scheduled",
        className: "border-[#b8664b]/28 bg-[#b8664b]/16 text-[#ffd7c4]",
      };
    }

    return {
      label: "Draft",
      className: "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
    };
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`rounded-[24px] border border-white/8 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] ${card.cardClassName}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-medium ${card.labelClassName}`}>{card.label}</p>
                  <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.04em] text-white">
                    {card.value}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClassName}`}
                >
                  <Icon size={20} />
                </span>
              </div>
              <p className={`mt-4 text-sm leading-6 ${card.descriptionClassName}`}>{card.description}</p>
              <div className={`mt-5 h-1.5 rounded-full ${card.progressTrackClassName}`}>
                <div
                  className={`h-full rounded-full ${card.progressFillClassName}`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

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

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-6">
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
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[24px] border border-white/8 bg-[#151d2c] shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#eef4ff]">All blogs</h2>
            <p className="mt-1 text-sm text-[#8ea0b8]">
              Review titles, publishing status, taxonomy, and quick actions in one place.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-[#2f6670]/24 bg-[#2f6670]/14 px-4 py-2 text-sm text-[#b8edf1]">
            Updated from connected data
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center px-6 py-10 text-sm text-[#8ea0b8]">
              Loading blogs...
            </div>
          ) : (
            <table className="min-w-[1360px] w-full border-collapse text-left">
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
                    const platformNames = getPlatformNames(blog.platforms);
                    const categoryNames = getCategoryNames(blog.category);
                    const tagNames = getTagNames(blog.tags);
                    const statusMeta = getStatusMeta(blog.status);

                    return (
                      <tr
                        key={blog.id}
                        className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <div className="max-w-[320px]">
                            <p className="truncate text-[17px] font-medium text-[#eef4ff]">
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
                          <p className="max-w-[160px] truncate text-sm text-[#dbe5f3]">
                            {blog.author || "Unknown"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex max-w-[220px] flex-wrap gap-2">
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
                          <div className="flex max-w-[240px] flex-wrap gap-2">
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
                          <p className="max-w-[180px] text-sm text-[#dbe5f3]">
                            {formatDateTime(blog.updated_at)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
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
      </section>

      {deleteBlogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101826] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Are you sure you want to delete this blog?
            </h3>
            <p className="text-sm leading-6 text-[#8ea0b8]">
              This will permanently remove the selected blog and its SEO settings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteBlogId(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-[#b8c4d4] transition hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteBlogId) {
                    handleDelete(deleteBlogId);
                    setDeleteBlogId(null);
                  }
                }}
                className="rounded-xl border border-red-400/20 bg-red-500/12 px-4 py-2 text-red-200 transition hover:bg-red-500/18"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedBlog && (
        <BlogPreviewModal
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          image={selectedBlog?.featured_image || ""}
          category={selectedBlog?.category || []}
          categories={categoryData?.data || []}
          publishDate={selectedBlog?.publish_date}
          updateDate={selectedBlog?.updated_at}
          createDate={selectedBlog?.created_at}
          readingTime={selectedBlog?.reading_time}
          title={selectedBlog?.blog_title}
          faq={selectedBlog?.faq || []}
          excerpt={selectedBlog?.short_excerpt}
          formContent={selectedBlog?.full_content}
          tags={
            selectedBlog?.tags?.map((tId: number) => {
              const tag = tagData?.data?.find((t: any) => t.id === tId);
              return tag?.name;
            }).filter(Boolean) || []
          }
          relatedBlogs={selectedBlog?.related || []}
          allBlogs={{ data: blogs }}
          selectedPlatforms={selectedBlog?.platforms || []}
          platformData={platformData}
          platformSettings={platformSettings}
        />
      )}
    </>
  );
};

export default Blogs;
