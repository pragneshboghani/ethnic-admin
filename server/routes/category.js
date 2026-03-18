const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");
const postCategoryToPlatform = require("../utils/postCategoryToPlatform");

const CategoryRouter = express.Router();

CategoryRouter.get("/all", authMiddleware, async (req, res) => {
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

CategoryRouter.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, slug, description, status, platforms } = req.body;

    let platformData = [];

    if (platforms && platforms.length > 0) {
      const [data] = await mysqlpool.query(
        `SELECT * FROM platforms WHERE id IN (?)`,
        [platforms],
      );
      platformData = data;
    }

    console.log("req.body", req.body);
    console.log("platformData", platformData);

    const results = await Promise.all(
      platformData.map((platform) =>
        postCategoryToPlatform(platform, {
          name,
          slug,
          description,
          status,
        }),
      ),
    );

    const [result] = await mysqlpool.query(
      `INSERT INTO category (name, slug, description, status, platform_ids) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description, status, platforms],
    );

    res.send({
      success: true,
      message: "category uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = CategoryRouter;
