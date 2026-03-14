import axios from "axios";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const BlogActions = {
  GetAllBlogs: async () => {
    try {
      const response = await axios.get(`${BACKEND_DOMAIN}/api/blogs/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },
  GetFilteredBlogs: async (filters: {
    platform?: string | number;
    status?: string;
    search?: string;
    author?: string;
    category?: string;
    tags?: string;
  }) => {
    try {
      const {
        platform = "0",
        status = "all",
        search = "",
        author = "",
        category = "",
        tags = "",
      } = filters;

      let query = `?platform=${platform}`;
      if (status !== "all") query += `&status=${status}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (author) query += `&author=${encodeURIComponent(author)}`;
      if (category) query += `&category=${encodeURIComponent(category)}`;
      if (tags) query += `&tags=${encodeURIComponent(tags)}`;

      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/blogs/filter${query}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },
  AddBlog: async (data: any) => {
    try {
      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/blogs/add`,
        data,
      );

      return response;
    } catch (error) {
      console.error("Error Adding Blog:", error);
      throw error;
    }
  },
  AddSEO: async (blogId: number, seoData: any[]) => {
    try {
      const response = await axios.post(`${BACKEND_DOMAIN}/api/seo/add`, {
        blog_id: blogId,
        seo: seoData,
      });
      return response;
    } catch (error) {
      console.error("Error Adding SEO data:", error);
      throw error;
    }
  },
};

export default BlogActions;
