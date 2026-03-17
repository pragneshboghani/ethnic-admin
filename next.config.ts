import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BACKEND_DOMAIN:'http://192.168.1.180:5003'
  }
};

export default nextConfig;
