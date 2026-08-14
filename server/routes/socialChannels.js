const express = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");
const generateSlug = require("../utils/generateSlug");
const { toPositiveNumber, canManageProjects } = require("../utils/calendarHelpers");

const socialChannelRouter = express.Router();

socialChannelRouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      `SELECT id, name, slug, color, icon_key, char_limit, sort_order, status, created_at, updated_at
       FROM social_channels
       ORDER BY sort_order ASC, name ASC, id ASC`,
    );

    return res.status(200).json({
      success: true,
      message: "Social channels fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching social channels:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialChannelRouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add social channels",
      });
    }

    const { name, color, icon_key, char_limit, sort_order, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Channel name is required" });
    }

    const slug = await generateSlug(name);

    const [[existing]] = await mysqlpool.query(
      `SELECT id FROM social_channels WHERE slug = ?`,
      [slug],
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A channel with this name already exists",
      });
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO social_channels (name, slug, color, icon_key, char_limit, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        slug,
        color || "#354b73",
        icon_key || slug,
        toPositiveNumber(char_limit),
        Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        status === "inactive" ? "inactive" : "active",
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Social channel added successfully",
      data: { id: result.insertId, slug },
    });
  } catch (error) {
    console.error("Error adding social channel:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialChannelRouter.put("/update", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update social channels",
      });
    }

    const channelId = toPositiveNumber(req.query.id);

    if (!channelId) {
      return res.status(400).json({ success: false, message: "Valid channel id is required" });
    }

    const { name, color, icon_key, char_limit, sort_order, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Channel name is required" });
    }

    const [result] = await mysqlpool.query(
      `UPDATE social_channels
       SET name = ?, color = ?, icon_key = ?, char_limit = ?, sort_order = ?, status = ?
       WHERE id = ?`,
      [
        String(name).trim(),
        color || "#354b73",
        icon_key || null,
        toPositiveNumber(char_limit),
        Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        status === "inactive" ? "inactive" : "active",
        channelId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Social channel not found" });
    }

    return res.status(200).json({ success: true, message: "Social channel updated successfully" });
  } catch (error) {
    console.error("Error updating social channel:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

socialChannelRouter.delete("/delete", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    if (!canManageProjects(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete social channels",
      });
    }

    const channelId = toPositiveNumber(req.query.id);

    if (!channelId) {
      return res.status(400).json({ success: false, message: "Valid channel id is required" });
    }

    const [[{ accountCount }]] = await mysqlpool.query(
      `SELECT COUNT(*) AS accountCount FROM project_social_accounts WHERE channel_id = ?`,
      [channelId],
    );

    if (accountCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This channel is used by ${accountCount} account(s). Set it inactive instead of deleting.`,
      });
    }

    const [result] = await mysqlpool.query(`DELETE FROM social_channels WHERE id = ?`, [channelId]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Social channel not found" });
    }

    return res.status(200).json({ success: true, message: "Social channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting social channel:", error);

    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = socialChannelRouter;
