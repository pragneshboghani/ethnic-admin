import Cookies from "js-cookie";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const BlogActions = {
  getAllBlogs: async () => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/all`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/get?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }) => {
    try {
      const token = UserActions.getToken();

      const {
        platform = "0",
        status = "all",
        search = "",
        author = "",
        category = "",
        tags = "",
      } = filters;

      const params = new URLSearchParams();
      params.append("platform", platform.toString());
      if (status !== "all") params.append("status", status);
      if (search) params.append("search", search);
      if (author) params.append("author", author);
      if (category) params.append("category", category);
      if (tags) params.append("tags", tags);

      const res = await fetch(
        `${BACKEND_DOMAIN}/api/blogs/filter?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  addSEO: async (blogId: number, seoData: any[]) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/seo/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blog_id: blogId, seo: seoData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add SEO data");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error adding SEO data:", error.message);
      throw error;
    }
  },

  deleteBlog: async (id: number) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(`${BACKEND_DOMAIN}/api/blogs/delete?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  fetchCategory: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/category/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch blogs");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching Category:", error.message);
      throw error;
    }
  },

  createCategory: async (data: {
    name: string;
    description: string;
    status: string;
    platforms: number[];
  }) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/category/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add Category");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error adding Category:", error.message);
      throw error;
    }
  },

  fetchTags: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/tags/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch tags");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching Tags:", error.message);
      throw error;
    }
  },

  createTag: async (data: {
    name: string;
    description: string;
    status: string;
    platforms: number[];
  }) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/tags/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add Tag");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error adding Tag:", error.message);
      throw error;
    }
  },
};

export default BlogActions;
