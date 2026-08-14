import { getHeaders } from "@/utils/getHeaders";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${BACKEND_DOMAIN}/api/social-channels${path}`, {
    headers: getHeaders(),
    ...init,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Social channel request failed");
  }

  return data;
};

const SocialChannelActions = {
  getAllChannels: async () => request("/all"),

  addChannel: async (payload: Record<string, unknown>) =>
    request("/add", { method: "POST", body: JSON.stringify(payload) }),

  updateChannel: async (id: number, payload: Record<string, unknown>) =>
    request(`/update?id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteChannel: async (id: number) => request(`/delete?id=${id}`, { method: "DELETE" }),
};

export default SocialChannelActions;
