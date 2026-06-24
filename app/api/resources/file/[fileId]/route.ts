import { cookies } from "next/headers";
import fs from "fs";
import {
  isValidResourceAccessToken,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import {
  getResourceFileAbsolutePath,
  getResourceFileById,
} from "@/utils/server/resourceRepository";

export async function GET(
  request: Request,
  context: { params: Promise<{ fileId: string }> | { fileId: string } },
) {
  const { fileId } = await Promise.resolve(context.params);
  const parsedFileId = Number(fileId);

  if (!Number.isInteger(parsedFileId) || parsedFileId <= 0) {
    return Response.json(
      {
        success: false,
        message: "Invalid file id",
      },
      { status: 400 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const cookieStore = await cookies();
  const resourceAccessCookie = cookieStore.get(RESOURCE_ACCESS_COOKIE_NAME)?.value;
  const hasPublicAccess = isValidResourceAccessToken(resourceAccessCookie);

  if (!hasPublicAccess) {
    return Response.json(
      {
        success: false,
        message: "You are not allowed to access this file.",
      },
      { status: 401 },
    );
  }

  try {
    const resourceFile = await getResourceFileById(parsedFileId);

    if (!resourceFile) {
      return Response.json(
        {
          success: false,
          message: "Resource file not found",
        },
        { status: 404 },
      );
    }

    const absolutePath = getResourceFileAbsolutePath(resourceFile.file_path);

    if (!fs.existsSync(absolutePath)) {
      return Response.json(
        {
          success: false,
          message: "File not found on disk",
        },
        { status: 404 },
      );
    }

    const fileBuffer = await fs.promises.readFile(absolutePath);
    const safeFileName = (resourceFile.original_name || resourceFile.stored_name)
      .replace(/"/g, "")
      .trim();

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": resourceFile.mime_type || "application/octet-stream",
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `${searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="${safeFileName}"`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to access this file",
      },
      { status: 500 },
    );
  }
}
