"use client";

import BlogActions from "@/actions/BlogAction";
import PlateformActions from "@/actions/PlateFormActions";
import { formatDateTime } from "@/utils/formatDateTime";
import { Eye, Pencil, Trash2, X } from "lucide-react";
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
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectUpdate, setSelectUpdate] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("0");
  const [status, setStatus] = useState("all");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const fetchPlatforms = async () => {
      const res = await PlateformActions.GetAllPlateform();
      setPlatformData(res);
    };
    const fetchCategory = async () => {
      const category = await BlogActions.FetchCategory();
      setCategoryData(category);
    }
    const fetchTag = async () => {
      const tag = await BlogActions.FetchTags();
      setTagData(tag);
    }
    fetchPlatforms();
    fetchCategory()
    fetchTag()
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await BlogActions.GetFilteredBlogs({
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
      await BlogActions.DeleteBlog(id);

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

  return (
    <>
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center justify-between">

          <input
            type="text"
            placeholder="Search blogs..."
            className="border px-4 py-2 rounded-lg w-60 border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* <input
            type="text"
            placeholder="Author"
            className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          /> */}

          <input
            type="text"
            placeholder="Category"
            className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {platformData?.totalPlatforms > 0 && (
            <select
              className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none h-full"
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
            className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none h-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all" className="text-black">All Status</option>
            <option value="Published" className="text-black">Published</option>
            <option value="Draft" className="text-black">Draft</option>
            <option value="Scheduled" className="text-black">Scheduled</option>
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
                {/* <th className="p-2">Author</th> */}
                <th className="p-2">Category</th>
                <th className="p-2">Tags</th>
                <th className="p-2">Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
                blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-700">
                    <td className="p-2 max-w-[250px] truncate">{b.blog_title}</td>
                    <td className="p-2 max-w-[50px] truncate">
                      {b.platforms.map((pId: number) => {
                        const platform = platformData?.data.find((plat: any) => plat.id === pId);
                        return (
                          <span key={pId} className="mr-2">
                            {platform ? platform.platform_name : "N/A"}
                          </span>
                        );
                      })}
                    </td>
                    <td className="p-2 max-w-[100px] truncate">{b.status}</td>
                    {/* <td className="p-2 max-w-[125px] truncate">{b.author}</td> */}
                    <td className="p-2 max-w-[165px] truncate">{b.category}</td>
                    <td className="p-2 max-w-[265px] truncate">{b.tags?.join(", ")}</td>
                    <td className="p-2 max-w-[230px] truncate">{formatDateTime(b.created_at)}</td>
                    <td className="p-2 flex items-center gap-2">
                      <button
                        className="text-white hover:text-blue-500"
                        title="Show Blog"
                        onClick={() => setSelectedBlog(b)}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 text-white rounded-xl p-6 w-full max-w-[1000px] relative glass-card">
            <button
              className="absolute top-2 right-2 text-white hover:text-red-500"
              onClick={() => setSelectedBlog(null)}
            >
              <X size={20} />
            </button>

            <img src={`${process.env.BACKEND_DOMAIN}/${selectedBlog.featured_image}`} alt={`${selectedBlog.blog_title}`} className="float-right w-[300px] h-[300px] rounded-[15px]" />
            <h2 className="text-2xl font-bold mb-4">{selectedBlog.blog_title}</h2>
            <div className="text-white flex gap-10">
              {selectedBlog.author && (<p className="mb-2"><strong className="text-gray-700">Author:</strong> By {selectedBlog.author}</p>)}
              {" • "}
              {selectedBlog.readingTime || 0} min read
            </div>
            <p className="mb-2"><strong className="text-gray-700">Platform:</strong> {selectedBlog.platforms.map((pId: number) => {
              const platform = platformData?.data.find((plat: any) => plat.id === pId);
              return (
                <span key={pId}>{platform ? platform.platform_name : "N/A"} </span>
              );
            })}</p>
            <p className="mb-2"><strong className="text-gray-700">Status:</strong> {selectedBlog.status}</p>
            <p className="mb-2"><strong className="text-gray-700">Category:</strong> {selectedBlog.category}</p>
            <p className="mb-2"><strong className="text-gray-700">Tags:</strong> {selectedBlog.tags?.join(", ")}</p>
            <p className="mb-2">
              <strong className="text-gray-700">Create Date:</strong>{formatDateTime(selectedBlog.created_at)}</p>
            <p className="mb-2">
              <strong className="text-gray-700">Publish Date:</strong>
              {formatDateTime(selectedBlog.publish_date)}
            </p>
            <p className="mb-2"><strong className="text-gray-700">Short Excerpt:</strong> {selectedBlog.short_excerpt}</p>
            {selectedBlog.related.length > 0 && (
              <p className="mb-2">
                <strong className="text-gray-700">Related:</strong>{" "}
                {selectedBlog.related
                  .map((r: number) => {
                    const blog = blogs?.find((b: any) => b.id === r);
                    return blog?.blog_title;
                  })
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            <p className="mb-2 h-full max-h-[250px] overflow-y-auto">
              <strong className="text-gray-700">Content:</strong> <span className="mt-4" dangerouslySetInnerHTML={{ __html: selectedBlog.full_content }} />
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Blogs;