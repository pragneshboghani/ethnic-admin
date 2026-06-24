import { cookies } from "next/headers";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceAdminUserFromToken } from "@/utils/server/resourceAuth";
import { deleteResourceFile } from "@/utils/server/resourceRepository";

const parseFileId = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ fileId: string }> | { fileId: string } },
) {
  const cookieStore = await cookies();
  const user = getResourceAdminUserFromToken(cookieStore.get("token")?.value);
  const hasResourceAccess = isValidResourceAccessToken(
    cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value,
  );

  if (!user || !hasResourceAccess) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to delete resource files",
      },
      { status: 403 },
    );
  }

  const { fileId: rawFileId } = await Promise.resolve(context.params);
  const fileId = parseFileId(rawFileId);

  if (!fileId) {
    return Response.json(
      {
        success: false,
        message: "Invalid file id",
      },
      { status: 400 },
    );
  }

  try {
    await deleteResourceFile(fileId);

    return Response.json({
      success: true,
      message: "Resource file deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resource file";
    const status = message === "Resource file not found" ? 404 : 500;

    return Response.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
