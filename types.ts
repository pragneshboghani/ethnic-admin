export interface Platform {
  id?: number;
  platform_name: string;
  website_url: string;
  api_endpoint: string;
  auth_token: string;
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
