import { cookies } from "next/headers";
import ResourceManager from "@/components/resources/ResourceManager";
import ResourceAccessGate from "@/components/resources/ResourceAccessGate";
import {
  isResourcePasswordConfigured,
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";

export default async function ResourceManagementPage() {
  const cookieStore = await cookies();
  const resourceAccessCookie = cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value;
  const hasResourceAccess = isValidResourceAccessToken(resourceAccessCookie);
  const isConfigured = isResourcePasswordConfigured();

  if (!hasResourceAccess) {
    return <ResourceAccessGate isConfigured={isConfigured} />;
  }

  return <ResourceManager />;
}
