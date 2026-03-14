"use client";

import DashBoardActions from "@/actions/DashboardAction";
import { FetchDashBoardData } from "@/utils/dashboardStats";
import { useEffect, useState } from "react";

const Dashboard = () => {

  const [days, setDays] = useState("7");
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [activePlateform, setactivePlateform] = useState([])

  const stats = FetchDashBoardData()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDays(value);
  };

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      const res = await DashBoardActions.GetRecentlyBlog(days);
      setRecentBlogs(res.data);
    };

    fetchRecentBlogs();
  }, [days]);

  useEffect(() => {
    const fetchActivePlatform = async () => {
      const res = await DashBoardActions.GetActivePlatform()
      setactivePlateform(res.data)
    }
    fetchActivePlatform()
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="p-5 glass-card"
            >
              <div className="flex justify-between items-center mb-4">
                <Icon className={item.color} size={22} />
                <span className="text-xs text-gray-400">LIVE</span>
              </div>

              <h2 className="text-3xl font-bold">{item.value}</h2>
              <p className="text-gray-400 text-sm">{item.title}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Blogs */}
        <div className="p-6 glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Blogs</h3>
            <select
              value={days}
              onChange={handleChange}
              className="text-gray-300 text-sm rounded-lg px-3 h-fit focus:outline-none"
            >
              <option value="1" className="text-black">Last 1 Day</option>
              <option value="3" className="text-black">Last 3 Days</option>
              <option value="7" className="text-black">Last 7 Days</option>
            </select>
          </div>

          <div className="text-gray-400 text-sm">
            {recentBlogs.length === 0 ? (
              "No blogs created yet."
            ) : (
              recentBlogs.map((blog: any, index: number) => (
                <div
                  key={blog.id}
                  className={`py-2 ${index !== recentBlogs.length - 1 ? "border-b border-gray-700" : ""
                    }`}
                >
                  {blog.blog_title}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Platforms */}
        <div className="p-6 glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Active Platforms</h3>
            <a href="" className="cursor-pointer btn btn-primary">+ Add New Platform</a>
          </div>

          <div className="text-gray-400 text-sm">
            {activePlateform.length === 0 ? (
              "No active platforms."
            ) : (
              activePlateform.map((platform: any, index: number) => (
                <div
                  key={platform.id}
                  className={`py-2 flex justify-between items-center ${index !== activePlateform.length - 1 ? "border-b border-gray-700" : ""
                    }`}
                >
                  <span>{platform.platform_name}</span>

                  <a
                    href={platform.website_url}
                    target="_blank"
                    className="text-blue-400 text-xs hover:underline"
                  >
                    Visit
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;