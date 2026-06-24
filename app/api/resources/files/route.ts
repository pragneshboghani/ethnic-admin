import { cookies } from "next/headers";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getResourceAdminUserFromToken } from "@/utils/server/resourceAuth";
import { createResourceFile } from "@/utils/server/resourceRepository";

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
        message: "You are not allowed to upload resource files",
      },
      { status: 403 },
    );
  }

  try {
    const payload = (await request.json()) as {
      groupId?: number;
      title?: string;
      description?: string;
      originalName?: string;
      file?: string;
    };

    if (!payload.groupId) {
      return Response.json(
        {
          success: false,
          message: "A valid group is required",
        },
        { status: 400 },
      );
    }

    if (!payload.file) {
      return Response.json(
        {
          success: false,
          message: "File data is required",
        },
        { status: 400 },
      );
    }

    const fileId = await createResourceFile(user.id, {
      groupId: Number(payload.groupId),
      title: payload.title,
      description: payload.description,
      originalName: String(payload.originalName || ""),
      file: payload.file,
    });

    return Response.json(
      {
        success: true,
        message: "Resource file uploaded successfully",
        fileId,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload resource file";
    const status =
      message === "Resource group not found"
        ? 404
        : [
              "Invalid file format",
              "Unsupported file format",
              "Uploaded file is empty",
              "File size exceeds the 25 MB limit",
            ].includes(message)
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
