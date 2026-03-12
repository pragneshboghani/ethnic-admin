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
};

export default BlogActions;
