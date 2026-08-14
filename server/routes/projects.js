const express = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");
const generateSlug = require("../utils/generateSlug");
const {
  normalizeIdList,
  toPositiveNumber,
  canManageProjects,
  canAccessCalendar,
} = require("../utils/calendarHelpers");

const projectRouter = express.Router();

const formatProjectRow = (row) => ({
  ...row,
  platform_ids: normalizeIdList(row.platform_ids),
  members: normalizeIdList(row.members),
});

const getUniqueProjectSlug = async (name, excludeId = null) => {
  const baseSlug = (await generateSlug(name || "project")) || "project";
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const params = [candidateSlug];
    let query = "SELECT id FROM projects WHERE slug = ?";

    if (excludeId) {
      query += " AND id <> ?";
      params.push(excludeId);
    }

    const [[existingProject]] = await mysqlpool.query(query, params);

    if (!existingProject) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const getAccountsByProjectIds = async (projectIds) => {
  if (!projectIds.length) {
    return [];
  }

  const [rows] = await mysqlpool.query(
    `SELECT psa.id, psa.project_id, psa.channel_id, psa.account_name, psa.handle,
            psa.profile_url, psa.status, psa.notes, psa.created_at, psa.updated_at,
            sc.name AS channel_name, sc.slug AS channel_slug, sc.color AS channel_color,
            sc.icon_key, sc.char_limit
     FROM project_social_accounts psa
     LEFT JOIN social_channels sc ON sc.id = psa.channel_id
     WHERE psa.project_id IN (?)
     ORDER BY sc.sort_order ASC, psa.account_name ASC, psa.id ASC`,
    [projectIds],
  );

  return rows;
};

projectRouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canAccessCalendar(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to the content calendar",
      });
    }

    const [rows] = await mysqlpool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.color, p.logo_url, p.website_url,
              p.status, p.platform_ids, p.members, p.created_by,
              creator.name AS created_by_name, p.created_at, p.updated_at,
              (SELECT COUNT(*) FROM project_social_accounts psa WHERE psa.project_id = p.id) AS account_count,
              (SELECT COUNT(*) FROM social_posts sp WHERE sp.project_id = p.id) AS post_count
       FROM projects p
       LEFT JOIN users creator ON creator.id = p.created_by
       ORDER BY p.status ASC, p.name ASC, p.id ASC`,
    );

    const projects = rows.map(formatProjectRow);
    const accounts = await getAccountsByProjectIds(projects.map((p) => p.id));

    for (const project of projects) {
      project.accounts = accounts.filter((a) => a.project_id === project.id);
    }

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.get("/get", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canAccessCalendar(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to the content calendar",
      });
    }

    const projectId = toPositiveNumber(req.query.id);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Valid project id is required" });
    }

    const [[project]] = await mysqlpool.query(
      `SELECT * FROM projects WHERE id = ?`,
      [projectId],
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const formatted = formatProjectRow(project);
    formatted.accounts = await getAccountsByProjectIds([projectId]);

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching project:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create projects",
      });
    }

    const { name, description, color, logo_url, website_url, status, platform_ids, members } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const slug = await getUniqueProjectSlug(name);

    const [result] = await mysqlpool.query(
      `INSERT INTO projects
       (name, slug, description, color, logo_url, website_url, status, platform_ids, members, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        slug,
        description || null,
        color || "#354b73",
        logo_url || null,
        website_url || null,
        status === "archived" ? "archived" : "active",
        JSON.stringify(normalizeIdList(platform_ids)),
        JSON.stringify(normalizeIdList(members)),
        req.user?.id || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { id: result.insertId, slug },
    });
  } catch (error) {
    console.error("Error creating project:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.put("/update", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update projects",
      });
    }

    const projectId = toPositiveNumber(req.query.id);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Valid project id is required" });
    }

    const [[existing]] = await mysqlpool.query(`SELECT * FROM projects WHERE id = ?`, [projectId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const { name, description, color, logo_url, website_url, status, platform_ids, members } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const slug =
      String(name).trim() === existing.name
        ? existing.slug
        : await getUniqueProjectSlug(name, projectId);

    await mysqlpool.query(
      `UPDATE projects
       SET name = ?, slug = ?, description = ?, color = ?, logo_url = ?, website_url = ?,
           status = ?, platform_ids = ?, members = ?
       WHERE id = ?`,
      [
        String(name).trim(),
        slug,
        description || null,
        color || "#354b73",
        logo_url || null,
        website_url || null,
        status === "archived" ? "archived" : "active",
        JSON.stringify(normalizeIdList(platform_ids)),
        JSON.stringify(normalizeIdList(members)),
        projectId,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: { id: projectId, slug },
    });
  } catch (error) {
    console.error("Error updating project:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.delete("/delete", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete projects",
      });
    }

    const projectId = toPositiveNumber(req.query.id);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Valid project id is required" });
    }

    const [[{ postCount }]] = await mysqlpool.query(
      `SELECT COUNT(*) AS postCount FROM social_posts WHERE project_id = ?`,
      [projectId],
    );

    if (postCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This project has ${postCount} calendar post(s). Archive it instead of deleting.`,
      });
    }

    await mysqlpool.query(`DELETE FROM project_social_accounts WHERE project_id = ?`, [projectId]);

    const [result] = await mysqlpool.query(`DELETE FROM projects WHERE id = ?`, [projectId]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.get("/accounts", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canAccessCalendar(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to the content calendar",
      });
    }

    const projectId = toPositiveNumber(req.query.projectId);

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Valid project id is required" });
    }

    const accounts = await getAccountsByProjectIds([projectId]);

    return res.status(200).json({
      success: true,
      message: "Social accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching social accounts:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.post("/accounts", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add social accounts",
      });
    }

    const { project_id, channel_id, account_name, handle, profile_url, status, notes } = req.body;

    const projectId = toPositiveNumber(project_id);
    const channelId = toPositiveNumber(channel_id);

    if (!projectId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Valid project and channel are required",
      });
    }

    if (!account_name || !String(account_name).trim()) {
      return res.status(400).json({ success: false, message: "Account name is required" });
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO project_social_accounts
       (project_id, channel_id, account_name, handle, profile_url, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        channelId,
        String(account_name).trim(),
        handle || null,
        profile_url || null,
        status === "inactive" ? "inactive" : "active",
        notes || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Social account added successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error adding social account:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.put("/accounts", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update social accounts",
      });
    }

    const accountId = toPositiveNumber(req.query.id);

    if (!accountId) {
      return res.status(400).json({ success: false, message: "Valid account id is required" });
    }

    const { channel_id, account_name, handle, profile_url, status, notes } = req.body;
    const channelId = toPositiveNumber(channel_id);

    if (!channelId) {
      return res.status(400).json({ success: false, message: "Valid channel is required" });
    }

    if (!account_name || !String(account_name).trim()) {
      return res.status(400).json({ success: false, message: "Account name is required" });
    }

    const [result] = await mysqlpool.query(
      `UPDATE project_social_accounts
       SET channel_id = ?, account_name = ?, handle = ?, profile_url = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        channelId,
        String(account_name).trim(),
        handle || null,
        profile_url || null,
        status === "inactive" ? "inactive" : "active",
        notes || null,
        accountId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Social account not found" });
    }

    return res.status(200).json({ success: true, message: "Social account updated successfully" });
  } catch (error) {
    console.error("Error updating social account:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

projectRouter.delete("/accounts", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete social accounts",
      });
    }

    const accountId = toPositiveNumber(req.query.id);

    if (!accountId) {
      return res.status(400).json({ success: false, message: "Valid account id is required" });
    }

    const [result] = await mysqlpool.query(
      `DELETE FROM project_social_accounts WHERE id = ?`,
      [accountId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Social account not found" });
    }

    return res.status(200).json({ success: true, message: "Social account deleted successfully" });
  } catch (error) {
    console.error("Error deleting social account:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = projectRouter;
