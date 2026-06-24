import "server-only";

import fs from "fs";
import path from "path";

const serverEnvPath = path.join(process.cwd(), "server", ".env");

let cachedEnv: Record<string, string> | null = null;

const parseEnvFile = () => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const values: Record<string, string> = {};

  if (!fs.existsSync(serverEnvPath)) {
    cachedEnv = values;
    return values;
  }

  const fileContents = fs.readFileSync(serverEnvPath, "utf8");

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    values[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }

  cachedEnv = values;
  return values;
};

export const getServerEnvValue = (key: string) => {
  const runtimeValue = process.env[key];

  if (runtimeValue !== undefined && runtimeValue !== "") {
    return runtimeValue;
  }

  return parseEnvFile()[key];
};

export const getRequiredServerEnvValue = (key: string) => {
  const value = getServerEnvValue(key);

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
};
