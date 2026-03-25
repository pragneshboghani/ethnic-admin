const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");
const generateSlug = require("../utils/generateSlug");
const postCategoryToPlatform = require("../utils/postCategoryToPlatform");
const { getPlatformsByIds } = require("../utils/platformHelper");

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

module.exports = tagRouter;
