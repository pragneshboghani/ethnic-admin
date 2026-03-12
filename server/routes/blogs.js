const Router = require("express");
const mysqlpool = require("../config/db");

const BlogRouter = Router();

BlogRouter.get("/all", async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM blogs");
    res.status(200).send({
      success: true,
      totalBlogs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

BlogRouter.get("/get", async (req, res) => {
  try {
    const { id } = req.query;

    const [rows] = await mysqlpool.query("SELECT * FROM blogs WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).send({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

BlogRouter.post("/add", async (req, res) => {
  try {
    const {
      category,
      blog_title,
      featured_image,
      full_content,
      short_excerpt,
      author,
      publish_date,
      expire_date,
      related,
      status,
      platforms,
    } = req.body;

    const [result] = await mysqlpool.query(
      `INSERT INTO blogs 
      (category, blog_title, featured_image, full_content, short_excerpt, author, publish_date, expire_date, related, status, platforms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category,
        blog_title,
        featured_image,
        full_content,
        short_excerpt,
        author,
        publish_date,
        expire_date,
        related,
        status,
        JSON.stringify(platforms),
      ],
    );

    res.status(201).send({
      success: true,
      message: "Blog added successfully",
      blogId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding blog:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

BlogRouter.get("/by-platform", async (req, res) => {
  try {
    const { platform } = req.query;

    if (!platform) {
      return res.status(400).send({
        success: false,
        message: "platform is required",
      });
    }

    const [rows] = await mysqlpool.query(
      `SELECT * FROM blogs 
       WHERE JSON_CONTAINS(platforms, JSON_ARRAY(?))`,
      [platform],
    );

    res.status(200).send({
      success: true,
      totalBlogs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

BlogRouter.put("/update", async (req, res) => {
  try {
    const { id } = req.query;

    const {
      category,
      blog_title,
      featured_image,
      full_content,
      short_excerpt,
      author,
      publish_date,
      expire_date,
      related,
      status,
      platforms,
    } = req.body;

    const [[raw]] = await mysqlpool.query(`SELECT * FROM blogs WHERE id = ?`, [
      id,
    ]);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const UpdatedData = {
      category: category ?? raw.category,
      blog_title: blog_title ?? raw.blog_title,
      featured_image: featured_image ?? raw.featured_image,
      full_content: full_content ?? raw.full_content,
      short_excerpt: short_excerpt ?? raw.short_excerpt,
      author: author ?? raw.author,
      publish_date: publish_date ?? raw.publish_date,
      expire_date: expire_date ?? raw.expire_date,
      related: related ?? raw.related,
      status: status ?? raw.status,
      platforms: platforms ? JSON.stringify(platforms) : raw.platforms,
    };

    await mysqlpool.query(
      `UPDATE blogs SET category = ?, blog_title = ?, featured_image = ?, full_content = ?, short_excerpt = ?, author = ?,
            publish_date = ?, expire_date = ?, related = ?, status = ?, platforms = ?, updated_at = NOW() WHERE id = ?`,
      [
        UpdatedData.category,
        UpdatedData.blog_title,
        UpdatedData.featured_image,
        UpdatedData.full_content,
        UpdatedData.short_excerpt,
        UpdatedData.author,
        UpdatedData.publish_date,
        UpdatedData.expire_date,
        UpdatedData.related,
        UpdatedData.status,
        UpdatedData.platforms,
        id,
      ],
    );

    res.status(200).send({
      success: true,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

BlogRouter.delete("/delete", async (req, res) => {
  try {
    const { id } = req.query;

    const [[raw]] = await mysqlpool.query(`SELECT * FROM blogs WHERE id = ?`, [
      id,
    ]);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const [result] = await mysqlpool.query("DELETE FROM blogs WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = BlogRouter;
