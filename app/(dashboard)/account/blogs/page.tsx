"use client";

import BlogActions from "@/actions/BlogAction";
import DashBoardActions from "@/actions/DashboardAction";
import SEOActions from "@/actions/SEOAction";
import BlogPreviewModal from "@/components/blog/BlogPreviewModal";
import { formatDateTime } from "@/utils/formatDateTime";
import { Copy, Eye, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Blogs = () => {
  const router = useRouter()
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
          totalPlatforms: res.plateformData?.length
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
        tags
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
      await SEOActions.deleteSEO(id)

      toast.success("Blog successfully deleted! 🗑️");
      fetchBlogs()

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

    fetchPlatformSettings(selectedBlog)
  }, [selectedBlog != null])
  return (
    <>
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">

          <input
            type="text"
            placeholder="Search blogs..."
            className="border px-2 py-2 rounded-lg w-47 border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Author"
            className="border px-2 py-2 rounded-lg w-47 border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <select
            className="border p-3 rounded-lg w-47 border-[#ffffff1a] focus:outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" className="text-black">All Categories</option>
            {categoryData?.data?.map((cat: any) => (
              <option key={cat.id} value={cat.id} className="text-black">
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="border p-3 rounded-lg w-47 border-[#ffffff1a] focus:outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          >
            <option value="" className="text-black">All Tags</option>
            {tagData?.data?.map((tag: any) => (
              <option key={tag.id} value={tag.id} className="text-black">
                {tag.name}
              </option>
            ))}
          </select>

          {platformData?.totalPlatforms > 0 && (
            <select
              className="border p-3 rounded-lg w-47 border-[#ffffff1a] focus:outline-none focus-visible:outline-none h-full"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="0" className="text-black">All Platforms</option>
              {platformData.data.map((p: any) => (
                <option key={p.id} value={p.id} className="text-black">
                  {p.platform_name}
                </option>
              ))}
            </select>
          )}

          <select
            className="border p-3 rounded-lg w-47 border-[#ffffff1a] focus:outline-none focus-visible:outline-none h-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all" className="text-black">All Status</option>
            <option value="publish" className="text-black">Published</option>
            <option value="draft" className="text-black">Draft</option>
            <option value="future" className="text-black">Scheduled</option>
          </select>

        </div>
      </div>
      <div className="glass-card p-4 mt-5">
        {loading ? (
          <p>Loading blogs...</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-b-[#ffffff1a]">
              <tr className="text-white">
                <th className="p-2">Blog Title</th>
                <th className="p-2">Platform</th>
                <th className="p-2">Status</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Tags</th>
                <th className="p-2">Last Updated Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
                blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-700">
                    <td className="p-2 max-w-[300px] truncate">{b.blog_title}</td>
                    <td className="p-2 max-w-[100px] truncate">
                      {b.platforms.map((pId: number) => {
                        const platform = platformData?.data.find((plat: any) => plat.id === pId);
                        return (
                          <span key={pId} className="mr-2">
                            {platform ? platform.platform_name : "N/A"}
                          </span>
                        );
                      })}
                    </td>
                    <td className="p-2 max-w-[100px] truncate">{b.status == 'future' ? 'scheduled' : b.status}</td>
                    <td className="p-2 max-w-[125px] truncate">{b.author}</td>
                    <td className="p-2 max-w-[165px] truncate">
                      {Array.isArray(b.category)
                        ? b.category
                          .map((cId: number) => {
                            const cat = categoryData?.data?.find((c: any) => c.id === cId);
                            return cat ? cat.name : null;
                          })
                          .filter(Boolean)
                          .join(", ")
                        : ""}
                    </td>
                    <td className="p-2 max-w-[200px] truncate">
                      {Array.isArray(b.tags)
                        ? b.tags
                          .map((tId: number) => {
                            const tag = tagData?.data?.find((t: any) => t.id === tId);
                            return tag ? tag.name : null;
                          })
                          .filter(Boolean)
                          .join(", ")
                        : ""}
                    </td>
                    <td className="p-2 max-w-[150px] truncate">{formatDateTime(b.updated_at)}</td>
                    <td className="p-2 flex items-center gap-2">
                      <button
                        className="text-white hover:text-blue-500"
                        title="Show Blog"
                        onClick={() => {
                          setSelectedBlog(b);
                          setShowPreview(true);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-white hover:text-blue-500"
                        title="Edit Blog"
                        onClick={() => setSelectUpdate(b.id!)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="text-white hover:text-emerald-400"
                        title="Duplicate Blog"
                        onClick={() => setDuplicateBlogId(b.id!)}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="text-white hover:text-red-500"
                        title="Delete Platform"
                        onClick={() => setDeleteBlogId(b.id!)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-2 text-center">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {deleteBlogId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-[400px] text-center glass-card">
            <h3 className="text-white text-lg font-semibold mb-4">
              Are you sure you want to delete this blog?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteBlogId(null)}
                className="px-4 py-2 rounded-lg btn"
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
                className="px-4 py-2 rounded-lg transition btn"
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