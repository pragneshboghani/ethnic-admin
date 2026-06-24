import { cookies } from "next/headers";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceAdminUserFromToken } from "@/utils/server/resourceAuth";
import { createResourceGroup } from "@/utils/server/resourceRepository";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const user = getResourceAdminUserFromToken(cookieStore.get("token")?.value);
  const hasResourceAccess = isValidResourceAccessToken(
    cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value,
  );

  if (!user || !hasResourceAccess) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to create resource groups",
      },
      { status: 403 },
    );
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      sortOrder?: number;
    };

    const groupId = await createResourceGroup(user.id, {
      name: String(payload.name || ""),
      description: payload.description,
      sortOrder: payload.sortOrder,
    });

    return Response.json(
      {
        success: true,
        message: "Resource group created successfully",
        groupId,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create resource group";
    const status = message === "Group name is required" ? 400 : 500;

    return Response.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
