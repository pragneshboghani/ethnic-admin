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
};

export default PlateformActions;
