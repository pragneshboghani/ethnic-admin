import { cookies } from "next/headers";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceUserFromToken } from "@/utils/server/resourceAuth";
import { getResourceLibrary } from "@/utils/server/resourceRepository";

export async function GET() {
  const cookieStore = await cookies();
  const user = getResourceUserFromToken(cookieStore.get("token")?.value);
  const hasResourceAccess = isValidResourceAccessToken(
    cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value,
  );

  if (!user || !hasResourceAccess) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to view the resource library.",
      },
      { status: 403 },
    );
  }

  try {
    return Response.json({
      success: true,
      ...(await getResourceLibrary()),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load the resource library",
      },
      { status: 500 },
    );
  }
}
