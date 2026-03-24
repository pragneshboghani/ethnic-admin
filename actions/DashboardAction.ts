import Cookies from "js-cookie";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const DashBoardActions = {
  getAllDashboardData: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/dashboard/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }

      const data = await res.json();
      return data.countData;
    } catch (error: any) {
      console.error("Error fetching GetAllDashboardData:", error.message);
      throw error;
    }
  },

  getRecentlyBlog: async (days: string) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(
        `${BACKEND_DOMAIN}/api/blogs/recent?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch recent blogs");
      }

      const data = await res.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching GetRecentlyBlog:", error.message);
      throw error;
    }
  },

  getActivePlatform: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/platforms/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Failed to fetch active platforms",
        );
      }

      const data = await res.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching GetActivePlatform:", error.message);
      throw error;
    }
  },
};

export default DashBoardActions;
