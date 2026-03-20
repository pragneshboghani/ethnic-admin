import { Platform } from "@/types";
import Cookies from "js-cookie";
import UserActions from "./UserAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const PlateformActions = {
  GetAllPlateform: async () => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/platforms/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch platforms");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching Platforms:", error.message);
      throw error;
    }
  },

  AddPlateformData: async (data: Platform) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(`${BACKEND_DOMAIN}/api/platforms/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add platform");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error Adding Platform:", error.message);
      throw error;
    }
  },

  DeletePlateForm: async (id: number) => {
    try {
      const token = UserActions.getToken();

      const res = await fetch(
        `${BACKEND_DOMAIN}/api/platforms/delete?id=${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete platform");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error Deleting Platform:", error.message);
      throw error;
    }
  },

  UpdatePlateForm: async (id: number, data: Platform) => {
    try {
      const token = UserActions.getToken();
      const res = await fetch(
        `${BACKEND_DOMAIN}/api/platforms/update?id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update platform");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error Updating Platform:", error.message);
      throw error;
    }
  },
};

export default PlateformActions;
