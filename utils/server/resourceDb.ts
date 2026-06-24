import "server-only";

import mysql from "mysql2/promise";
import { getRequiredServerEnvValue } from "./resourceEnv";

declare global {
  var resourceLibraryPool: mysql.Pool | undefined;
}

const createPool = () =>
  mysql.createPool({
    host: getRequiredServerEnvValue("MYSQL_HOST"),
    user: getRequiredServerEnvValue("MYSQL_USER"),
    password: getRequiredServerEnvValue("MYSQL_PASSWORD"),
    database: getRequiredServerEnvValue("MYSQL_DATABASE"),
    multipleStatements: true,
  });

export const resourceDb =
  globalThis.resourceLibraryPool || createPool();

if (!globalThis.resourceLibraryPool) {
  globalThis.resourceLibraryPool = resourceDb;
}
