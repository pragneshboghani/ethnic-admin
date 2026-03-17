import type { Metadata } from "next";

export const BaseMetadata: Metadata = {
  title: "Ethnic Admin",
  description:
    "Ethnic Admin is a powerful dashboard to manage blogs, media, and multi-platform content with ease. Streamline your content workflow, authentication, and media handling in one place.",
  keywords: [
    "Ethnic Admin",
    "Admin Dashboard",
    "Content Management",
    "Blog Management",
    "Media Management",
    "Multi Platform Content",
    "Next.js Admin Panel",
  ],
  authors: [{ name: "Ethnic Admin Team" }],
  creator: "Ethnic Admin",
  applicationName: "Ethnic Admin",

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Ethnic Admin",
    description:
      "Manage blogs, platforms, and media efficiently with Ethnic Admin dashboard.",
    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
  },
};
