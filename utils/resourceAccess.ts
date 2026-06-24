import { createHmac, timingSafeEqual } from "crypto";
import { getServerEnvValue } from "./server/resourceEnv";

export const RESOURCE_ACCESS_COOKIE_NAME = "resource_access";
export const RESOURCE_ACCESS_COOKIE_MAX_AGE = 60 * 5;

const getResourceAccessSecret = () =>
  getServerEnvValue("RESOURCE_ACCESS_COOKIE_SECRET")?.trim() ||
  getServerEnvValue("INTERNAL_RESOURCES_PASSWORD")?.trim() ||
  "";

const buildSignature = (issuedAt: string) =>
  createHmac("sha256", getResourceAccessSecret())
    .update(`resource-access:${issuedAt}`)
    .digest("hex");

export const isResourcePasswordConfigured = () =>
  Boolean(getServerEnvValue("INTERNAL_RESOURCES_PASSWORD")?.trim());

export const createResourceAccessToken = () => {
  if (!getResourceAccessSecret()) {
    throw new Error("Resource access secret is not configured");
  }

  const issuedAt = Date.now().toString();
  return `${issuedAt}.${buildSignature(issuedAt)}`;
};

export const isValidResourceAccessToken = (token?: string | null) => {
  if (!token || !getResourceAccessSecret()) {
    return false;
  }

  const [issuedAt, providedSignature] = token.split(".");

  if (!issuedAt || !providedSignature || !/^\d+$/.test(issuedAt)) {
    return false;
  }

  const issuedAtMs = Number(issuedAt);

  if (!Number.isFinite(issuedAtMs)) {
    return false;
  }

  if (Date.now() - issuedAtMs > RESOURCE_ACCESS_COOKIE_MAX_AGE * 1000) {
    return false;
  }

  const expectedSignature = buildSignature(issuedAt);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};
