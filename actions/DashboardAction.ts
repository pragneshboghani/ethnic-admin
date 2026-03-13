import axios from "axios";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const DashBoardActions = {
  GetAllDashboardData: async () => {
    try {
      const response = await axios.get(`${BACKEND_DOMAIN}/api/dashboard/all`);
      return response.data.countData;
    } catch (error) {
      console.error("Error fetching GetAllDashboardData:", error);
      throw error;
    }
  },
  GetRecentlyBlog: async (days: string) => {
    try {
      const response = await axios.get(
        `${BACKEND_DOMAIN}/api/blogs/recent?days=${days}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching GetRecentlyBlog:", error);
      throw error;
    }
  },
  GetActivePlatform: async () => {
    try {
      const response = await axios.get(`${BACKEND_DOMAIN}/api/platforms/active`);
      return response.data;
    } catch (error) {
      console.error("Error fetching GetAllDashboardData:", error);
      throw error;
    }
  },
};

export default DashBoardActions;
