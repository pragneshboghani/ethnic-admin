import axios from "axios";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const MediaActions = {
  uploadMedia: async (file: string, alt: string) => {
    try {
      const res = await axios.post(`${BACKEND_DOMAIN}/api/media/add`, {
        file,
        alt,
      });

      return res.data;
    } catch (error: any) {
      console.error("Upload media error:", error);
      throw error.response?.data || error;
    }
  },
  getAllMedia: async () => {
    try {
      const res = await axios.get(`${BACKEND_DOMAIN}/api/media/all`);
      return res.data;
    } catch (error: any) {
      console.error("Fetch media error:", error);
      throw error.response?.data || error;
    }
  },
  filterMedia: async (type?: string, search?: string) => {
    try {
      const params: any = {};

      if (type && type !== "all") {
        params.type = type;
      }

      if (search) {
        params.search = search;
      }

      const res = await axios.get(`${BACKEND_DOMAIN}/api/media/filter`, {
        params,
      });

      return res.data;
    } catch (error: any) {
      console.error("Filter media error:", error);
      throw error.response?.data || error;
    }
  },
};

export default MediaActions;
