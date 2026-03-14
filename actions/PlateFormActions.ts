import { Platform } from "@/types";
import axios from "axios";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const PlateformActions = {
  GetAllPlateform: async () => {
    try {
      const response = await axios.get(`${BACKEND_DOMAIN}/api/platforms/all`);
      return response;
    } catch (error) {
      console.error("Error fetching Platforms:", error);
      throw error;
    }
  },
  AddPlateformData: async (data: Platform) => {
    try {
      const response = await axios.post(
        `${BACKEND_DOMAIN}/api/platforms/add`,
        data,
      );

      return response;
    } catch (error) {
      console.error("Error Adding Platforms:", error);
      throw error;
    }
  },
  DeletePlateForm: async (id: number) => {
    try {
      const response = await axios.delete(
        `${BACKEND_DOMAIN}/api/platforms/delete`,
        {
          params: { id },
        },
      );
      return response;
    } catch (error) {
      console.error("Error Deleting Platform:", error);
      throw error;
    }
  },
  UpdatePlateForm: async (id: number, data: Platform) => {
    try {
      const response = await axios.put(
        `${BACKEND_DOMAIN}/api/platforms/update`,
        data,
        {
          params: { id },
        },
      );
      return response;
    } catch (error) {
      console.error("Error Updating Platform:", error);
      throw error;
    }
  },
};

export default PlateformActions;
