import { getHeaders } from "@/utils/getHeaders";
import type { SocialPostPayload } from "@/types";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${BACKEND_DOMAIN}/api/social-posts${path}`, {
    headers: getHeaders(),
    ...init,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Social post request failed");
  }

  return data;
};

const SocialPostActions = {
  getCalendar: async (filters: {
    from: string;
    to: string;
    projectId?: number | null;
    status?: string;
    accountId?: number | null;
    assignedTo?: number | null;
    includeBlogs?: boolean;
  }) => {
    const params = new URLSearchParams();
    params.append("from", filters.from);
    params.append("to", filters.to);

    if (filters.projectId) params.append("projectId", String(filters.projectId));
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.accountId) params.append("accountId", String(filters.accountId));
    if (filters.assignedTo) params.append("assignedTo", String(filters.assignedTo));
    if (filters.includeBlogs === false) params.append("includeBlogs", "false");

    return request(`/calendar?${params.toString()}`);
  },

  getById: async (id: number) => request(`/get?id=${id}`),

  addPost: async (payload: SocialPostPayload) =>
    request("/add", { method: "POST", body: JSON.stringify(payload) }),

  updatePost: async (id: number, payload: SocialPostPayload) =>
    request(`/update?id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  reschedule: async (id: number, scheduledAt: string) =>
    request(`/reschedule?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    }),

  markPublished: async (id: number, liveUrl?: string) =>
    request(`/publish?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ live_url: liveUrl || null }),
    }),

  deletePost: async (id: number) => request(`/delete?id=${id}`, { method: "DELETE" }),
};

export default SocialPostActions;
