const mysqlpool = require("../config/db");

const AUDITED_BLOG_FIELDS = [
  "blog_title",
  "short_excerpt",
  "full_content",
  "faq",
  "featured_image",
  "category",
  "tags",
  "author",
  "publish_date",
  "reading_time",
  "related",
  "status",
  "platforms",
  "slug",
];

const AUDITED_SEO_FIELDS = [
  "blog_id",
  "platform_id",
  "slug",
  "publish_status",
  "seo_title",
  "meta_description",
  "canonical_url",
  "cta_button_text",
  "cta_button_link",
];

const safeParseJsonArray = (value) => {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const normalizeDateTime = (value) => {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const pad = (num) => String(num).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate(),
  )} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(
    parsed.getSeconds(),
  )}`;
};

const getAuditedFields = (entityType = "blog") => {
  if (entityType === "seo_blog") {
    return AUDITED_SEO_FIELDS;
  }

  return AUDITED_BLOG_FIELDS;
};

const normalizeComparableValue = (field, value, entityType = "blog") => {
  if (
    entityType === "blog" &&
    ["faq", "category", "tags", "related", "platforms"].includes(field)
  ) {
    return safeParseJsonArray(value);
  }

  if (field === "publish_date") {
    return normalizeDateTime(value);
  }

  if (["reading_time", "blog_id", "platform_id"].includes(field)) {
    return value === undefined || value === null || value === ""
      ? null
      : Number(value);
  }

  return value ?? null;
};

const getComparableSnapshot = ({ entityType = "blog", data = {} }) => {
  const auditedFields = getAuditedFields(entityType);

  return auditedFields.reduce((acc, field) => {
    acc[field] = normalizeComparableValue(field, data[field], entityType);
    return acc;
  }, {});
};

const valuesAreEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const getChangedFieldPayload = ({
  oldData = {},
  newData = {},
  actionType,
  entityType = "blog",
}) => {
  const auditedFields = getAuditedFields(entityType);
  const previousSnapshot = getComparableSnapshot({ entityType, data: oldData });
  const nextSnapshot = getComparableSnapshot({ entityType, data: newData });

  if (actionType === "create") {
    return {
      changedFields: auditedFields.filter(
        (field) => nextSnapshot[field] !== null && nextSnapshot[field] !== "",
      ),
      oldValues: {},
      newValues: nextSnapshot,
    };
  }

  if (actionType === "delete") {
    return {
      changedFields: auditedFields.filter(
        (field) => previousSnapshot[field] !== null && previousSnapshot[field] !== "",
      ),
      oldValues: previousSnapshot,
      newValues: {},
    };
  }

  const changedFields = [];
  const oldValues = {};
  const newValues = {};

  auditedFields.forEach((field) => {
    if (!valuesAreEqual(previousSnapshot[field], nextSnapshot[field])) {
      changedFields.push(field);
      oldValues[field] = previousSnapshot[field];
      newValues[field] = nextSnapshot[field];
    }
  });

  return { changedFields, oldValues, newValues };
};

const resolveChangeField = (actionType, changedFields) => {
  if (actionType === "create") return "created";
  if (actionType === "delete") return "deleted";
  if (changedFields.length === 1) return changedFields[0];
  if (changedFields.length > 1) return "multiple";
  return "no_change";
};

const logHistory = async ({
  blogId,
  entityType = "blog",
  entityId = null,
  platformId = null,
  actionType,
  oldData = {},
  newData = {},
  changedByUserId = null,
  changedByName = null,
  triggerSource = "manual",
}) => {
  const { changedFields, oldValues, newValues } = getChangedFieldPayload({
    oldData,
    newData,
    actionType,
    entityType,
  });

  if (actionType === "update" && changedFields.length === 0) {
    return null;
  }

  const changeField = resolveChangeField(actionType, changedFields);

  const [result] = await mysqlpool.query(
    `INSERT INTO blog_publish_history
      (blog_id, entity_type, entity_id, platform_id, action_type, change_field, changed_fields, old_values, new_values, trigger_source, changed_by_user_id, changed_by_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      blogId,
      entityType,
      entityId,
      platformId,
      actionType,
      changeField,
      JSON.stringify(changedFields),
      JSON.stringify(oldValues),
      JSON.stringify(newValues),
      triggerSource,
      changedByUserId,
      changedByName,
    ],
  );

  return result.insertId;
};

const logBlogHistory = async ({
  blogId,
  entityId = null,
  actionType,
  oldBlog = {},
  newBlog = {},
  changedByUserId = null,
  changedByName = null,
  triggerSource = "manual",
}) => {
  return logHistory({
    blogId,
    entityType: "blog",
    entityId: entityId ?? blogId,
    actionType,
    oldData: oldBlog,
    newData: newBlog,
    changedByUserId,
    changedByName,
    triggerSource,
  });
};

const logSeoHistory = async ({
  blogId,
  seoId = null,
  platformId = null,
  actionType,
  oldSeo = {},
  newSeo = {},
  changedByUserId = null,
  changedByName = null,
  triggerSource = "manual",
}) => {
  return logHistory({
    blogId,
    entityType: "seo_blog",
    entityId: seoId,
    platformId,
    actionType,
    oldData: oldSeo,
    newData: newSeo,
    changedByUserId,
    changedByName,
    triggerSource,
  });
};

module.exports = {
  AUDITED_BLOG_FIELDS,
  AUDITED_SEO_FIELDS,
  getComparableBlogSnapshot: (blog = {}) =>
    getComparableSnapshot({ entityType: "blog", data: blog }),
  getComparableSeoSnapshot: (seo = {}) =>
    getComparableSnapshot({ entityType: "seo_blog", data: seo }),
  logBlogHistory,
  logHistory,
  logSeoHistory,
  normalizeDateTime,
};
