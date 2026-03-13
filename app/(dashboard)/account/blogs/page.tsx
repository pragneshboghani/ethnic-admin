"use client";

import BlogActions from "@/actions/BlogAction";
import PlateformActions from "@/actions/PlateFormActions";
import { useEffect, useState } from "react";

const Blogs = () => {
  const [platformData, setPlatformData] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("0");
  const [status, setStatus] = useState("all");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const fetchPlatforms = async () => {
      const res = await PlateformActions.GetAllPlateform();
      setPlatformData(res.data);
    };
    fetchPlatforms();
  }, []);

  useEffect(() => {
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

    fetchBlogs();
  }, [platform, status, search, tags, category, author]);

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

          <input
            type="text"
            placeholder="Author"
            className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

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

          <div className="flex gap-3 h-full">
            {platformData?.totalPlatforms > 0 && (
              <select
                className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
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
              className="border px-3 py-2 rounded-lg border-[#ffffff1a] focus:outline-none focus-visible:outline-none"
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
                <th className="p-2">Date</th>
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
                    <td className="p-2 max-w-[125px] truncate">{b.author}</td>
                    <td className="p-2 max-w-[165px] truncate">{b.category}</td>
                    <td className="p-2 max-w-[265px] truncate">{b.tags?.join(", ")}</td>
                    <td className="p-2 max-w-[230px] truncate">{b.created_at}</td>
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
    </>
  );
};

export default Blogs;