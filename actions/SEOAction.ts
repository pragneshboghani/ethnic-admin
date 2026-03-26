import Cookies from "js-cookie";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const SEOActions = {
  GetByBlogsAndPlatform: async (blogId: number, plateformId: number) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(
        `${BACKEND_DOMAIN}/api/seo/getbyblog?blog_id=${blogId}&platform_id=${plateformId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
  updateSEO: async (blogId: number, seoData: any[]) => {
    const token = UserActions.getToken();

    const res = await fetch(`${BACKEND_DOMAIN}/api/seo/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blog_id: blogId, seo: seoData }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update SEO data");
    }

    return await res.json();
  },
  deleteSEO: async (blogId: number) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(`${BACKEND_DOMAIN}/api/seo/delete?id=${blogId}`, {
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
};

export default SEOActions;
