import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BACKEND_DOMAIN:'https://api-admin.ethnicinfotech.in',
    NEXT_PUBLIC_X_API_KEY : 'a0a4acf730943ccdb4efdb7894ec7f13946169d585271367f008563af0da80b3'
  },
  images: {
    domains: ['api-admin.ethnicinfotech.in'],
  },
};

export default nextConfig;
