import Cookies from "js-cookie";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const MediaActions = {
  uploadMedia: async (file: string, alt: string) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/media/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file, alt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload media");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Upload media error:", error.message);
      throw error;
    }
  },

  getAllMedia: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/media/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch media");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Fetch media error:", error.message);
      throw error;
    }
  },

  filterMedia: async (type?: string) => {
    try {
      const token = UserActions.getToken();

      const queryParams = new URLSearchParams();
      if (type && type !== "all") queryParams.append("type", type);

      const res = await fetch(
        `${BACKEND_DOMAIN}/api/media/filter?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to filter media");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Filter media error:", error.message);
      throw error;
    }
  },

  UpdateALT: async (id: number, altText: string) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(`${BACKEND_DOMAIN}/api/media/update-alt/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alt_text: altText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update alt text");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Update ALT error:", error.message);
      throw error;
    }
  },

  DeleteMedia: async (id: number) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/media/delete?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete media");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Delete media error:", error.message);
      throw error;
    }
  },
};

export default MediaActions;
