const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");
const postCategoryToPlatform = require("../utils/postCategoryToPlatform");
const generateSlug = require("../utils/generateSlug");
const deleteCategory = require("../utils/deleteCategory");
const { getPlatformsByIds } = require("../utils/platformHelper");
const updateCategoryOnPlatform = require("../utils/updateCategoryOnPlatform");
const verifyApiKey = require("../middleware/verifyApiKey");

const categoryRouter = express.Router();

categoryRouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM category");
    res.status(200).send({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching Category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

categoryRouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { name, description, status, platforms } = req.body;

    const platformData = await getPlatformsByIds(platforms);

    const slug = await generateSlug(name);
    const results = await Promise.all(
      platformData.map((platform) =>
        postCategoryToPlatform(
          platform,
          {
            name,
            slug,
            description,
            status,
          },
          "category",
        ),
      ),
    );

    const [result] = await mysqlpool.query(
      `INSERT INTO category (name, slug, description, status, platform_ids) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description, status, JSON.stringify(platforms)],
    );

    res.send({
      success: true,
      message: "category Added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

categoryRouter.delete("/delete", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.query;

    const [[raw]] = await mysqlpool.query(
      `SELECT * FROM ${type} WHERE id = ?`,
      [id],
    );

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }

    const platformData = await getPlatformsByIds(raw.platform_ids);

    const [blogs] = await mysqlpool.query(
      `SELECT id, ${type} FROM blogs WHERE JSON_CONTAINS(${type}, ?)`,
      [id],
    );

    for (const blog of blogs) {
      const target = type == "category" ? blog.category : blog.tags;
      const categories = target.filter((cat) => cat !== Number(id));

      await mysqlpool.query(`UPDATE blogs SET ${type} = ? WHERE id = ?`, [
        JSON.stringify(categories),
        blog.id,
      ])
    }

    const results = await Promise.all(
      platformData.map((platform) =>
        deleteCategory(
          platform,
          raw.slug,
          type,
        ),
      ),
    );

    const [result] = await mysqlpool.query(`DELETE FROM ${type} WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: `${type} not found`,
      });
    }

    res.status(200).send({
      success: true,
      plarformResult: results,
      message: `${type} deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

categoryRouter.put("/update", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    const { name, description, status, platforms } = req.body;

    const [[raw]] = await mysqlpool.query(`SELECT * FROM category WHERE id = ?`, [
      id,
    ]);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
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
          updateCategoryOnPlatform(platform, payload, "category", raw.slug),
        ),
    );

    const addResults = await Promise.all(
      addedPlatforms.map((platform) =>
        postCategoryToPlatform(platform, payload, "category"),
      ),
    );

    const deleteResults = await Promise.all(
      removedPlatforms.map((platform) =>
        deleteCategory(platform, raw.slug, "category"),
      ),
    );

    await mysqlpool.query(
      `UPDATE category SET name = ?, description = ?, status = ?, platform_ids = ? WHERE id = ?`,
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
      message: "Category updated successfully",
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
module.exports = categoryRouter;
