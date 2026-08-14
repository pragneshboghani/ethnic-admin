const express = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");
const {
  safeParseJson,
  normalizeIdList,
  toPositiveNumber,
  formatDateForDb,
  formatDateForResponse,
  canAccessCalendar,
} = require("../utils/calendarHelpers");

const socialPostRouter = express.Router();

const requireCalendarAccess = (req, res, next) => {
  if (!canAccessCalendar(req.user)) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to the content calendar",
    });
  }

  next();
};

const POST_STATUSES = ["idea", "draft", "scheduled", "published", "archived"];

const normalizeStatus = (value) =>
  POST_STATUSES.includes(value) ? value : "idea";

const normalizeMedia = (value) =>
  safeParseJson(value)
    .filter((item) => item && typeof item.url === "string")
    .map((item) => ({
      url: item.url,
      file_type: item.file_type === "video" ? "video" : "image",
      mime_type: item.mime_type || null,
    }));

const getAccountsByIds = async (accountIds) => {
  if (!accountIds.length) {
    return new Map();
  }

  const [rows] = await mysqlpool.query(
    `SELECT psa.id, psa.account_name, psa.handle, psa.profile_url,
            sc.name AS channel_name, sc.slug AS channel_slug, sc.color AS channel_color,
            sc.icon_key, sc.char_limit
     FROM project_social_accounts psa
     LEFT JOIN social_channels sc ON sc.id = psa.channel_id
     WHERE psa.id IN (?)`,
    [accountIds],
  );

  return new Map(rows.map((row) => [row.id, row]));
};

const formatPostRow = (row, accountsById) => {
  const accountIds = normalizeIdList(row.account_ids);
  const media = normalizeMedia(row.media);

  return {
    ...row,
    account_ids: accountIds,
    media,
    scheduled_at: formatDateForResponse(row.scheduled_at),
    published_at: formatDateForResponse(row.published_at),
    accounts: accountIds
      .map((id) => accountsById.get(id))
      .filter(Boolean),
  };
};

const buildCalendarRange = (from, to) => {
  const start = formatDateForDb(from);
  const end = formatDateForDb(to);

  if (start && end) {
    return { start, end };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  return {
    start: start || formatDateForDb(monthStart),
    end: end || formatDateForDb(monthEnd),
  };
};

const getBlogOverlay = async (start, end, platformIds) => {
  const conditions = ["b.publish_date >= ?", "b.publish_date < ?", "b.status <> 'draft'"];
  const params = [start, end];

  if (platformIds.length) {
    conditions.push(
      `(${platformIds.map(() => "JSON_CONTAINS(b.platforms, CAST(? AS JSON))").join(" OR ")})`,
    );
    params.push(...platformIds.map(String));
  }

  const [rows] = await mysqlpool.query(
    `SELECT b.id, b.blog_title, b.publish_date, b.status, b.platforms
     FROM blogs b
     WHERE ${conditions.join(" AND ")}
     ORDER BY b.publish_date ASC`,
    params,
  );

  if (!rows.length) {
    return [];
  }

  const [platformRows] = await mysqlpool.query(
    `SELECT id, platform_name FROM platforms`,
  );
  const platformNameById = new Map(platformRows.map((p) => [p.id, p.platform_name]));

  return rows.map((row) => ({
    source: "blog",
    id: row.id,
    title: row.blog_title,
    start: formatDateForResponse(row.publish_date),
    status: row.status,
    platformNames: normalizeIdList(row.platforms)
      .map((id) => platformNameById.get(id))
      .filter(Boolean),
    editable: false,
  }));
};

socialPostRouter.get("/calendar", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const { start, end } = buildCalendarRange(req.query.from, req.query.to);

    const conditions = ["sp.scheduled_at >= ?", "sp.scheduled_at < ?"];
    const params = [start, end];

    const projectId = toPositiveNumber(req.query.projectId);
    if (projectId) {
      conditions.push("sp.project_id = ?");
      params.push(projectId);
    }

    if (POST_STATUSES.includes(req.query.status)) {
      conditions.push("sp.status = ?");
      params.push(req.query.status);
    }

    const accountId = toPositiveNumber(req.query.accountId);
    if (accountId) {
      conditions.push("JSON_CONTAINS(sp.account_ids, CAST(? AS JSON))");
      params.push(String(accountId));
    }

    const assignedTo = toPositiveNumber(req.query.assignedTo);
    if (assignedTo) {
      conditions.push("sp.assigned_to = ?");
      params.push(assignedTo);
    }

    const [postRows] = await mysqlpool.query(
      `SELECT sp.id, sp.project_id, sp.title, sp.caption, sp.link_url, sp.media, sp.post_type,
              sp.account_ids, sp.scheduled_at, sp.status, sp.assigned_to, sp.blog_id, sp.campaign,
              sp.published_at, sp.live_url,
              p.name AS project_name, p.color AS project_color,
              assignee.name AS assigned_to_name
       FROM social_posts sp
       LEFT JOIN projects p ON p.id = sp.project_id
       LEFT JOIN users assignee ON assignee.id = sp.assigned_to
       WHERE ${conditions.join(" AND ")}
       ORDER BY sp.scheduled_at ASC, sp.id ASC`,
      params,
    );

    const allAccountIds = [
      ...new Set(postRows.flatMap((row) => normalizeIdList(row.account_ids))),
    ];
    const accountsById = await getAccountsByIds(allAccountIds);

    const socialEvents = postRows.map((row) => {
      const post = formatPostRow(row, accountsById);

      return {
        source: "social",
        id: post.id,
        title: post.title,
        start: post.scheduled_at,
        status: post.status,
        projectId: post.project_id,
        projectName: post.project_name,
        projectColor: post.project_color,
        accounts: post.accounts,
        mediaCount: post.media.length,
        assignedToName: post.assigned_to_name,
        campaign: post.campaign,
        editable: true,
      };
    });

    let platformIds = [];

    if (projectId) {
      const [[project]] = await mysqlpool.query(
        `SELECT platform_ids FROM projects WHERE id = ?`,
        [projectId],
      );
      platformIds = normalizeIdList(project?.platform_ids);
    }

    const includeBlogs = req.query.includeBlogs !== "false";
    const shouldOverlayBlogs = includeBlogs && (!projectId || platformIds.length > 0);

    const blogEvents = shouldOverlayBlogs
      ? await getBlogOverlay(start, end, platformIds)
      : [];

    return res.status(200).json({
      success: true,
      message: "Calendar fetched successfully",
      data: [...socialEvents, ...blogEvents],
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.get("/get", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const postId = toPositiveNumber(req.query.id);

    if (!postId) {
      return res.status(400).json({ success: false, message: "Valid post id is required" });
    }

    const [[post]] = await mysqlpool.query(
      `SELECT sp.*, p.name AS project_name, p.color AS project_color,
              assignee.name AS assigned_to_name, b.blog_title
       FROM social_posts sp
       LEFT JOIN projects p ON p.id = sp.project_id
       LEFT JOIN users assignee ON assignee.id = sp.assigned_to
       LEFT JOIN blogs b ON b.id = sp.blog_id
       WHERE sp.id = ?`,
      [postId],
    );

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const accountsById = await getAccountsByIds(normalizeIdList(post.account_ids));

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: formatPostRow(post, accountsById),
    });
  } catch (error) {
    console.error("Error fetching post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.post("/add", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const {
      project_id, title, caption, hashtags, link_url, media, post_type,
      account_ids, scheduled_at, status, assigned_to, blog_id, campaign, notes,
    } = req.body;

    const projectId = toPositiveNumber(project_id);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project is required" });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const scheduledAt = formatDateForDb(scheduled_at);

    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "A valid scheduled date is required" });
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO social_posts
       (project_id, title, caption, hashtags, link_url, media, post_type, account_ids,
        scheduled_at, status, assigned_to, blog_id, campaign, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        String(title).trim(),
        caption || null,
        hashtags || null,
        link_url || null,
        JSON.stringify(normalizeMedia(media)),
        post_type || null,
        JSON.stringify(normalizeIdList(account_ids)),
        scheduledAt,
        normalizeStatus(status),
        toPositiveNumber(assigned_to),
        toPositiveNumber(blog_id),
        campaign || null,
        notes || null,
        req.user?.id || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creating post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.put("/update", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const postId = toPositiveNumber(req.query.id);

    if (!postId) {
      return res.status(400).json({ success: false, message: "Valid post id is required" });
    }

    const {
      project_id, title, caption, hashtags, link_url, media, post_type,
      account_ids, scheduled_at, status, assigned_to, blog_id, campaign, notes, live_url,
    } = req.body;

    const projectId = toPositiveNumber(project_id);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project is required" });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const scheduledAt = formatDateForDb(scheduled_at);

    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "A valid scheduled date is required" });
    }

    const nextStatus = normalizeStatus(status);

    const [result] = await mysqlpool.query(
      `UPDATE social_posts
       SET project_id = ?, title = ?, caption = ?, hashtags = ?, link_url = ?, media = ?,
           post_type = ?, account_ids = ?, scheduled_at = ?, status = ?, assigned_to = ?,
           blog_id = ?, campaign = ?, notes = ?, live_url = ?,
           published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, NOW()) ELSE NULL END
       WHERE id = ?`,
      [
        projectId,
        String(title).trim(),
        caption || null,
        hashtags || null,
        link_url || null,
        JSON.stringify(normalizeMedia(media)),
        post_type || null,
        JSON.stringify(normalizeIdList(account_ids)),
        scheduledAt,
        nextStatus,
        toPositiveNumber(assigned_to),
        toPositiveNumber(blog_id),
        campaign || null,
        notes || null,
        live_url || null,
        nextStatus,
        postId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.patch("/reschedule", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const postId = toPositiveNumber(req.query.id);

    if (!postId) {
      return res.status(400).json({ success: false, message: "Valid post id is required" });
    }

    const scheduledAt = formatDateForDb(req.body.scheduled_at);

    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "A valid scheduled date is required" });
    }

    const [result] = await mysqlpool.query(
      `UPDATE social_posts SET scheduled_at = ? WHERE id = ?`,
      [scheduledAt, postId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Post rescheduled successfully",
      data: { id: postId, scheduled_at: scheduledAt },
    });
  } catch (error) {
    console.error("Error rescheduling post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.patch("/publish", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const postId = toPositiveNumber(req.query.id);

    if (!postId) {
      return res.status(400).json({ success: false, message: "Valid post id is required" });
    }

    const [result] = await mysqlpool.query(
      `UPDATE social_posts
       SET status = 'published', published_at = COALESCE(published_at, NOW()), live_url = ?
       WHERE id = ?`,
      [req.body.live_url || null, postId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, message: "Post marked as published" });
  } catch (error) {
    console.error("Error publishing post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialPostRouter.delete("/delete", verifyApiKey, authMiddleware, requireCalendarAccess, async (req, res) => {
  try {
    const postId = toPositiveNumber(req.query.id);

    if (!postId) {
      return res.status(400).json({ success: false, message: "Valid post id is required" });
    }

    const [result] = await mysqlpool.query(`DELETE FROM social_posts WHERE id = ?`, [postId]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = socialPostRouter;
