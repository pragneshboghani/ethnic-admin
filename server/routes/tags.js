const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");
const generateSlug = require("../utils/generateSlug");
const postCategoryToPlatform = require("../utils/postCategoryToPlatform");
const { getPlatformsByIds } = require("../utils/platformHelper");
const deleteCategory = require("../utils/deleteCategory");
const updateCategoryOnPlatform = require("../utils/updateCategoryOnPlatform");

const tagRouter = express.Router();

tagRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM tags");
    res.status(200).send({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching Tags:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

tagRouter.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, description, status, platforms } = req.body;

    const platformData = await getPlatformsByIds(platforms);

    const slug = await generateSlug(name);
    const results = await Promise.all(
      platformData.map((platform) =>
        postCategoryToPlatform(platform, {
          name,
          slug,
          description,
          status,
        },'tags'),
      ),
    );

    const [result] = await mysqlpool.query(
      `INSERT INTO tags (name, slug, description, status, platform_ids) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description, status, JSON.stringify(platforms)],
    );

    res.send({
      success: true,
      message: "tag Added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

tagRouter.put("/update", authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    const { name, description, status, platforms } = req.body;

    const [[raw]] = await mysqlpool.query(`SELECT * FROM tags WHERE id = ?`, [id]);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    const existingPlatformIds = Array.isArray(raw.platform_ids)
      ? raw.platform_ids
      : JSON.parse(raw.platform_ids || "[]");
    const updatedPlatformIds =
      platforms !== undefined ? platforms : existingPlatformIds;

    const payload = {
      name: name ?? raw.name,
      description: description ?? raw.description,
      status: status ?? raw.status,
      slug: raw.slug,
    };

    const currentPlatforms = await getPlatformsByIds(existingPlatformIds);
    const addedPlatformIds = updatedPlatformIds.filter(
      (platformId) => !existingPlatformIds.includes(platformId),
    );
    const removedPlatformIds = existingPlatformIds.filter(
      (platformId) => !updatedPlatformIds.includes(platformId),
    );

    const addedPlatforms = await getPlatformsByIds(addedPlatformIds);
    const removedPlatforms = await getPlatformsByIds(removedPlatformIds);

    const updateResults = await Promise.all(
      currentPlatforms
        .filter((platform) => updatedPlatformIds.includes(platform.id))
        .map((platform) =>
          updateCategoryOnPlatform(platform, payload, "tags", raw.slug),
        ),
    );

    const addResults = await Promise.all(
      addedPlatforms.map((platform) =>
        postCategoryToPlatform(platform, payload, "tags"),
      ),
    );

    const deleteResults = await Promise.all(
      removedPlatforms.map((platform) =>
        deleteCategory(platform, raw.slug, "tags"),
      ),
    );

    await mysqlpool.query(
      `UPDATE tags SET name = ?, description = ?, status = ?, platform_ids = ? WHERE id = ?`,
      [
        payload.name,
        payload.description,
        payload.status,
        JSON.stringify(updatedPlatformIds),
        id,
      ],
    );

    res.status(200).send({
      success: true,
      message: "Tag updated successfully",
      results: {
        updated: updateResults,
        added: addResults,
        removed: deleteResults,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = tagRouter;
