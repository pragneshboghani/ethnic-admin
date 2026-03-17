export interface Platform {
  id?: number;
  platform_name: string;
  website_url: string;
  api_endpoint: string;
  auth_type: "none" | "token" | "basic";
  auth_token?: string;
  username?: string;
  password?: string;
  status: "Active" | "Inactive";
  created_at?: string;
  updated_at?: string;
}

export interface Media {
  id: number;
  url: string;
  alt: string;
  type: string;
}
