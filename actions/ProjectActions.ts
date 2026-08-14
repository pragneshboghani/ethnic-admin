import { getHeaders } from "@/utils/getHeaders";
import type { ProjectPayload, SocialAccountPayload } from "@/types";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${BACKEND_DOMAIN}/api/projects${path}`, {
    headers: getHeaders(),
    ...init,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Project request failed");
  }

  return data;
};

const ProjectActions = {
  getAllProjects: async () => request("/all"),

  getById: async (id: number) => request(`/get?id=${id}`),

  addProject: async (payload: ProjectPayload) =>
    request("/add", { method: "POST", body: JSON.stringify(payload) }),

  updateProject: async (id: number, payload: ProjectPayload) =>
    request(`/update?id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteProject: async (id: number) => request(`/delete?id=${id}`, { method: "DELETE" }),

  getAccounts: async (projectId: number) => request(`/accounts?projectId=${projectId}`),

  addAccount: async (payload: SocialAccountPayload) =>
    request("/accounts", { method: "POST", body: JSON.stringify(payload) }),

  updateAccount: async (id: number, payload: SocialAccountPayload) =>
    request(`/accounts?id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteAccount: async (id: number) => request(`/accounts?id=${id}`, { method: "DELETE" }),
};

export default ProjectActions;
