import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BACKEND_DOMAIN:'http://localhost:8090'
  }
};

export default nextConfig;
