const safeParseJson = (value) => {
  try {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    return JSON.parse(value);
  } catch (err) {
    console.error("JSON parse error:", value);
    return [];
  }
};

const normalizeIdList = (value) =>
  safeParseJson(value)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

const toPositiveNumber = (value) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const pad = (num) => String(num).padStart(2, "0");

const formatDateForDb = (value) => {
  if (!value) return null;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value.replace("T", " ")}:00`;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate(),
  )} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
};

const formatDateForResponse = (value) => {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate(),
  )}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const canManageProjects = (user) =>
  user?.role === "super_admin" || user?.role === "admin";

// Admins/super_admins always have calendar access — they're the ones granting
// or revoking it for everyone else, and shouldn't be able to lock themselves out.
const canAccessCalendar = (user) =>
  user?.role === "super_admin" || user?.role === "admin" || user?.can_access_calendar === true;

module.exports = {
  safeParseJson,
  normalizeIdList,
  toPositiveNumber,
  formatDateForDb,
  formatDateForResponse,
  canManageProjects,
  canAccessCalendar,
};
