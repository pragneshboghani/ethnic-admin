import "server-only";

import jwt from "jsonwebtoken";
import { getRequiredServerEnvValue } from "./resourceEnv";

type ResourceUserPayload = {
  id: number;
  role: string;
  email?: string;
  name?: string;
};

export const getResourceUserFromToken = (
  token?: string | null,
): ResourceUserPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      getRequiredServerEnvValue("JWT_SECRET"),
    ) as ResourceUserPayload;

    if (!decoded?.id) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

export const getResourceAdminUserFromToken = (
  token?: string | null,
): ResourceUserPayload | null => {
  const user = getResourceUserFromToken(token);

  if (!user) {
    return null;
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    return null;
  }

  return user;
};
