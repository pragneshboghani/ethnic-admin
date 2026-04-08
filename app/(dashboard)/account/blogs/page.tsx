"use client";

import BlogActions from "@/actions/BlogAction";
import DashBoardActions from "@/actions/DashboardAction";
import SEOActions from "@/actions/SEOAction";
import BlogFilters from "@/components/blog/BlogFilters";
import BlogListCard from "@/components/blog/BlogListCard";
import BlogListtable from "@/components/blog/BlogListtable";
import BlogPreviewModal from "@/components/blog/BlogPreviewModal";
import ClickOutside from "@/components/common/ClickOutside";
import { FetchSummaryCards } from "@/utils/summaryCards";
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
  const [sort, setSort] = useState("");

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
        sort,
      });
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [platform, status, search, tags, category, author, sort]);

  const handleDelete = async (id: number) => {
    try {
      await BlogActions.deleteBlog(id);

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

  const draftBlogs = blogs.filter((blog) => blog.status === "draft").length;
  const summaryCards = FetchSummaryCards(blogs, platformData);

  return (
    <>
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4">
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
              <p className={`mt-4 mb-5 text-sm leading-6 ${card.descriptionClassName}`}>{card.description}</p>
              <div className={`mt-auto h-1.5 rounded-full ${card.progressTrackClassName}`}>
                <div
                  className={`h-full rounded-full ${card.progressFillClassName}`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <BlogFilters loading={loading} blogs={blogs} draftBlogs={draftBlogs} search={search} setSearch={setSearch} author={author} setAuthor={setAuthor} category={category} setCategory={setCategory} categoryData={categoryData} tags={tags} setTags={setTags} tagData={tagData} platform={platform} setPlatform={setPlatform} platformData={platformData} status={status} setStatus={setStatus} sort={sort} setSort={setSort} />

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

        <BlogListtable blogs={blogs} platformData={platformData} categoryData={categoryData} tagData={tagData} setShowPreview={setShowPreview} setSelectedBlog={setSelectedBlog} setSelectUpdate={setSelectUpdate} setDuplicateBlogId={setDuplicateBlogId} setDeleteBlogId={setDeleteBlogId} loading={loading} />

        <BlogListCard blogs={blogs} platformData={platformData} categoryData={categoryData} tagData={tagData} setShowPreview={setShowPreview} setSelectedBlog={setSelectedBlog} setSelectUpdate={setSelectUpdate} setDuplicateBlogId={setDuplicateBlogId} setDeleteBlogId={setDeleteBlogId} loading={loading} />
      </section>

      {deleteBlogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <ClickOutside onClickOutside={() => setDeleteBlogId(null)}>
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
          </ClickOutside>
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
