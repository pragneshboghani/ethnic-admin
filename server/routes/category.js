const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");
const postCategoryToPlatform = require("../utils/postCategoryToPlatform");
const generateSlug = require("../utils/generateSlug");
const deleteCategory = require("../utils/deleteCategory");
const { getPlatformsByIds } = require("../utils/platformHelper");

const categoryRouter = express.Router();

categoryRouter.get("/all", authMiddleware, async (req, res) => {
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

categoryRouter.post("/add", authMiddleware, async (req, res) => {
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
          "categories",
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

categoryRouter.delete("/delete", authMiddleware, async (req, res) => {
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
          type == "category" ? "categories" : "tags",
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
module.exports = categoryRouter;
