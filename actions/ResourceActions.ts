import {
  ResourceGroupPayload,
  ResourceLibraryResponse,
  ResourceUploadPayload,
} from "@/types";

const getJsonResponse = async <T>(response: Response) => {
  const result = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
};

const ResourceActions = {
  getLibrary: async () => {
    const response = await fetch(`/api/resources/library`, {
      method: "GET",
      cache: "no-store",
    });

    return getJsonResponse<ResourceLibraryResponse>(response);
  },
  createGroup: async (payload: ResourceGroupPayload) => {
    const response = await fetch(`/api/resources/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return getJsonResponse<{ success: boolean; message: string; groupId: number }>(
      response,
    );
  },
  updateGroup: async (groupId: number, payload: ResourceGroupPayload) => {
    const response = await fetch(`/api/resources/groups/${groupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return getJsonResponse<{ success: boolean; message: string }>(response);
  },
  deleteGroup: async (groupId: number) => {
    const response = await fetch(`/api/resources/groups/${groupId}`, {
      method: "DELETE",
    });

    return getJsonResponse<{ success: boolean; message: string }>(response);
  },
  uploadFile: async (payload: ResourceUploadPayload) => {
    const response = await fetch(`/api/resources/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return getJsonResponse<{ success: boolean; message: string; fileId: number }>(
      response,
    );
  },
  deleteFile: async (fileId: number) => {
    const response = await fetch(`/api/resources/files/${fileId}`, {
      method: "DELETE",
    });

    return getJsonResponse<{ success: boolean; message: string }>(response);
  },
};

export default ResourceActions;
