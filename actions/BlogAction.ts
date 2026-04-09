import Cookies from "js-cookie";
import UserActions from "./UserAction";
import { getHeaders } from "@/utils/getHeaders";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const BlogActions = {
  getAllBlogs: async () => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/all`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch blogs");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching blogs:", error.message);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/get?id=${id}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch blogs");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching blogs:", error.message);
      throw error;
    }
  },

  getFilteredBlogs: async (filters: {
    platform?: string | number;
    status?: string;
    search?: string;
    author?: string;
    category?: string;
    tags?: string;
    sort?: string;
  }) => {
    try {
      const {
        platform = "0",
        status = "all",
        search = "",
        author = "",
        category = "",
        tags = "",
        sort = "none",
      } = filters;

      const params = new URLSearchParams();
      params.append("platform", platform.toString());
      if (status !== "all") params.append("status", status);
      if (search) params.append("search", search);
      if (author) params.append("author", author);
      if (category) params.append("category", category);
      if (tags) params.append("tags", tags);
      if (sort && sort !== "none") params.append("sort", sort);

      const res = await fetch(
        `${BACKEND_DOMAIN}/api/blogs/filter?${params.toString()}`,
        {
          headers: getHeaders(),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch filtered blogs");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching filtered blogs:", error.message);
      throw error;
    }
  },

  addBlog: async (data: any) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/add`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add blog");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error adding blog:", error.message);
      throw error;
    }
  },

  deleteBlog: async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/delete?id=${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete blog");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error deleting blog:", error.message);
      throw error;
    }
  },

  updateBlog: async (id: number, data: any) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/update?id=${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update blog");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error updating blog:", error.message);
      throw error;
    }
  },
};

export default BlogActions;
