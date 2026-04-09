import { getHeaders } from "@/utils/getHeaders";
import type { PublishHistoryItem } from "@/types";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

type PublishHistoryResponse = {
  success: boolean;
  data: PublishHistoryItem[];
};

const PublishHistoryActions = {
  getHistory: async (blogId: number): Promise<PublishHistoryResponse> => {
    try {
      const res = await fetch(
        `${BACKEND_DOMAIN}/api/publish_history/get_history?blogId=${blogId}`,
        {
          headers: getHeaders(),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch publish history");
      }

      return await res.json();
    } catch (error: unknown) {
      console.error(
        "Error fetching publish history:",
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  },
};

export default PublishHistoryActions;
