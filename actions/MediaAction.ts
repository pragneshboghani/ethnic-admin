import Cookies from "js-cookie";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const MediaActions = {
  uploadMedia: async (file: string, alt: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

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
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

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

  filterMedia: async (type?: string, search?: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not logged in");

      const queryParams = new URLSearchParams();
      if (type && type !== "all") queryParams.append("type", type);
      if (search) queryParams.append("search", search);

      const res = await fetch(`${BACKEND_DOMAIN}/api/media/filter?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
};

export default MediaActions;