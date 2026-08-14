import type { NextConfig } from "next";

const BACKEND_DOMAIN =
  process.env.BACKEND_DOMAIN || "https://api-admin.ethnicinfotech.in";

/**
 * next/image refuses any remote host that is not declared here, so the allowed
 * host is derived from BACKEND_DOMAIN — the same value that builds the image
 * URLs (`${BACKEND_DOMAIN}/${img_url}`). Previously this was a hard-coded list
 * containing only the production host, so every image threw
 * "hostname ... is not configured under images" as soon as the app ran against a
 * local or staging backend.
 *
 * Falls back silently if BACKEND_DOMAIN is not a valid URL: a throw here would
 * stop the dev server from booting at all, which is a worse failure than an
 * unoptimised image.
 */
function backendPattern() {
  try {
    const url = new URL(BACKEND_DOMAIN);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  env: {
    BACKEND_DOMAIN,
    NEXT_PUBLIC_X_API_KEY:
      "a0a4acf730943ccdb4efdb7894ec7f13946169d585271367f008563af0da80b3",
  },
  images: {
    // `images.domains` is deprecated in Next 16 in favour of remotePatterns.
    remotePatterns: [
      ...backendPattern(),
      // Production backend, kept explicitly so a build that does not set
      // BACKEND_DOMAIN still serves images.
      {
        protocol: "https",
        hostname: "api-admin.ethnicinfotech.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
