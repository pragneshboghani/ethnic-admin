import { cookies } from "next/headers";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceAdminUserFromToken } from "@/utils/server/resourceAuth";
import {
  deleteResourceGroup,
  updateResourceGroup,
} from "@/utils/server/resourceRepository";

const parseGroupId = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getAuthorizedUser = async () => {
  const cookieStore = await cookies();
  const user = getResourceAdminUserFromToken(cookieStore.get("token")?.value);
  const hasResourceAccess = isValidResourceAccessToken(
    cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value,
  );

  if (!user || !hasResourceAccess) {
    return null;
  }

  return user;
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ groupId: string }> | { groupId: string } },
) {
  const user = await getAuthorizedUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to update resource groups",
      },
      { status: 403 },
    );
  }

  const { groupId: rawGroupId } = await Promise.resolve(context.params);
  const groupId = parseGroupId(rawGroupId);

  if (!groupId) {
    return Response.json(
      {
        success: false,
        message: "Invalid group id",
      },
      { status: 400 },
    );
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      sortOrder?: number;
    };

    await updateResourceGroup(groupId, {
      name: String(payload.name || ""),
      description: payload.description,
      sortOrder: payload.sortOrder,
    });

    return Response.json({
      success: true,
      message: "Resource group updated successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update resource group";
    const status = message.includes("not found")
      ? 404
      : message === "Group name is required"
        ? 400
        : 500;

    return Response.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ groupId: string }> | { groupId: string } },
) {
  const user = await getAuthorizedUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to delete resource groups",
      },
      { status: 403 },
    );
  }

  const { groupId: rawGroupId } = await Promise.resolve(context.params);
  const groupId = parseGroupId(rawGroupId);

  if (!groupId) {
    return Response.json(
      {
        success: false,
        message: "Invalid group id",
      },
      { status: 400 },
    );
  }

  try {
    await deleteResourceGroup(groupId);

    return Response.json({
      success: true,
      message: "Resource group deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resource group";
    const status = message.includes("not found")
      ? 404
      : message.includes("Delete the files")
        ? 400
        : 500;

    return Response.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
