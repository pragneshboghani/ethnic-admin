import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import ResourceAccessGate from "@/components/resources/ResourceAccessGate";
import ResourceLibraryView from "@/components/resources/ResourceLibraryView";
import { BaseMetadata } from "@/components/common/baseMetadata";
import { ResourceLibraryResponse } from "@/types";
import {
  isResourcePasswordConfigured,
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceLibrary } from "@/utils/server/resourceRepository";

const resourcesFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  ...BaseMetadata,
  title: "Internal Resources | Ethnic Admin",
  description:
    "Internal resource library for company SOPs, guides, proposal formats, and strategy documents.",
};

export default async function ResourcesPage() {
  const cookieStore = await cookies();
  const resourceAccessCookie = cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value;
  const hasResourceAccess = isValidResourceAccessToken(resourceAccessCookie);
  const isConfigured = isResourcePasswordConfigured();

  let groups: ResourceLibraryResponse["groups"] = [];
  let errorMessage = "";

  if (hasResourceAccess && isConfigured) {
    try {
      const library = await getResourceLibrary();
      groups = library.groups;
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load the resource library.";
    }
  }

  return (
    <section
      className={`${resourcesFont.className} relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(86,120,168,0.26),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(46,97,106,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(115,72,61,0.18),_transparent_18%),linear-gradient(180deg,#07101a_0%,#0a1521_42%,#0c1320_100%)] px-4 py-10 sm:px-6 lg:px-8`}
    >
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.85)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.85)_1px,transparent_1px)] [background-size:86px_86px]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        {hasResourceAccess ? (
          <ResourceLibraryView groups={groups} errorMessage={errorMessage} />
        ) : (
          <ResourceAccessGate isConfigured={isConfigured} />
        )}
      </div>
    </section>
  );
}
