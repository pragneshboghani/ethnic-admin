import { getHeaders } from "@/utils/getHeaders";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const GroupActions = {
  getAllGroups: async () => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/groups/all`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch groups");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching Groups:", error.message);
      throw error;
    }
  },

  getGroupById: async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/groups/get?id=${id}`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch group");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching Group:", error.message);
      throw error;
    }
  },

  addGroup: async (data: any) => {
    try {
        console.log('data', data)
      const res = await fetch(`${BACKEND_DOMAIN}/api/groups/add`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add group");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error Adding Group:", error.message);
      throw error;
    }
  },

  updateGroup: async (id: number, data: any) => {
    try {
      const res = await fetch(`${BACKEND_DOMAIN}/api/groups/update?id=${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update group");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error Updating Group:", error.message);
      throw error;
    }
  },
};

export default GroupActions;
