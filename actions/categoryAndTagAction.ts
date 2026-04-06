import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

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
    } catch (error: unknown) {
      console.error("Error fetching Category:", getErrorMessage(error));
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
    } catch (error: unknown) {
      console.error("Error adding Category:", getErrorMessage(error));
      throw error;
    }
  },

  updateCategory: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      status?: string;
      platforms?: number[];
    },
  ) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/category/update?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update Category");
      }

      return await res.json();
    } catch (error: unknown) {
      console.error("Error updating Category:", getErrorMessage(error));
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
    } catch (error: unknown) {
      console.error("Error fetching Tags:", getErrorMessage(error));
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
    } catch (error: unknown) {
      console.error("Error adding Tag:", getErrorMessage(error));
      throw error;
    }
  },

  updateTag: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      status?: string;
      platforms?: number[];
    },
  ) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/tags/update?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update Tag");
      }

      return await res.json();
    } catch (error: unknown) {
      console.error("Error updating Tag:", getErrorMessage(error));
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
    } catch (error: unknown) {
      console.error("Error deleting blog:", getErrorMessage(error));
      throw error;
    }
  },
};

export default CategoryAndTagAction;
