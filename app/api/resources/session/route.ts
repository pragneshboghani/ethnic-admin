import { cookies } from "next/headers";
import {
  createResourceAccessToken,
  isResourcePasswordConfigured,
  RESOURCE_ACCESS_COOKIE_MAX_AGE,
  RESOURCE_ACCESS_COOKIE_NAME,
} from "@/utils/resourceAccess";
import { getServerEnvValue } from "@/utils/server/resourceEnv";

export async function POST(request: Request) {
  if (!isResourcePasswordConfigured()) {
    return Response.json(
      {
        success: false,
        message: "Resource password is not configured on the server.",
      },
      { status: 500 },
    );
  }

  let payload: { password?: string } = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const password = String(payload.password || "");

  if (!password) {
    return Response.json(
      {
        success: false,
        message: "Password is required.",
      },
      { status: 400 },
    );
  }

  if (password !== getServerEnvValue("INTERNAL_RESOURCES_PASSWORD")) {
    return Response.json(
      {
        success: false,
        message: "Incorrect password.",
      },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: RESOURCE_ACCESS_COOKIE_NAME,
    value: createResourceAccessToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RESOURCE_ACCESS_COOKIE_MAX_AGE,
  });

  return Response.json({
    success: true,
    message: "Resource access granted.",
  });
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: RESOURCE_ACCESS_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return Response.json({
    success: true,
    message: "Resource access removed.",
  });
}
