import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const CategoryAndTagAction = {
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

  deleteCategory: async (id: number, type: string) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(
        `${BACKEND_DOMAIN}/api/category/delete?id=${id}&type=${type}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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

export default CategoryAndTagAction;