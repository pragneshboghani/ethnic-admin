const express = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const postToPlatform = require("../utils/postToPlatform");
const generateSlug = require("../utils/generateSlug");
const deletePost = require("../utils/deletePost");
const verifyApiKey = require("../middleware/verifyApiKey");
const { getPlatformsByIds } = require("../utils/platformHelper");
require("dotenv").config();

const blogRouter = express.Router();

const safeParse = (value) => {
  try {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    return JSON.parse(value);
  } catch (err) {
    console.error("JSON parse error:", value);
    return [];
  }
};

const BASE_URL = "https://api-admin.ethnicinfotech.in/";

blogRouter.get("/all", authMiddleware, async (req, res) => {
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
      message: error.message,
    });
  }
});

blogRouter.get("/get", authMiddleware, async (req, res) => {
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
      message: error.message,
    });
  }
});

blogRouter.post("/add", authMiddleware, async (req, res) => {
  try {
    const {
      blog_title,
      short_excerpt,
      full_content,
      featured_image,
      category,
      tags,
      author,
      publish_date,
      reading_time,
      related,
      status,
      platforms,
    } = req.body;

    if (!publish_date || publish_date.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Publish date is required",
      });
    }

    const platformData = await getPlatformsByIds(platforms);

    const results = await Promise.all(
      platformData.map((platform) => postToPlatform(platform, req.body, null)),
    );

    const [result] = await mysqlpool.query(
      `INSERT INTO blogs 
      (blog_title, short_excerpt, full_content, featured_image, category, tags, author, publish_date, reading_time, related, status, platforms, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        blog_title,
        short_excerpt,
        full_content,
        featured_image,
        JSON.stringify(category),
        JSON.stringify(tags),
        author,
        publish_date,
        reading_time,
        JSON.stringify(related),
        status,
        JSON.stringify(platforms),
        results[0].data.slug,
      ],
    );

    res.status(201).send({
      success: true,
      message: "Blog added successfully",
      plarformResult: results,
      blogId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding blog:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

blogRouter.put("/update", authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const {
      blog_title,
      short_excerpt,
      full_content,
      featured_image,
      category,
      tags,
      author,
      publish_date,
      reading_time,
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

    const platformData = await getPlatformsByIds(platforms);

    const results = await Promise.all(
      platformData.map((platform) =>
        postToPlatform(platform, req.body, raw.slug),
      ),
    );

    // const failed = results.filter((r) => !r.success);

    // if (failed.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Platform update failed",
    //     errors: failed,
    //   });
    // }

    const UpdatedData = {
      blog_title: blog_title ?? raw.blog_title,
      short_excerpt: short_excerpt ?? raw.short_excerpt,
      full_content: full_content ?? raw.full_content,
      featured_image: featured_image ?? raw.featured_image,
      category: JSON.stringify(category ?? raw.category),

      tags: JSON.stringify(tags ?? raw.tags),
      author: author ?? raw.author,
      publish_date: publish_date ?? raw.publish_date,
      reading_time: reading_time ?? raw.reading_time,

      related: JSON.stringify(related ?? raw.related),
      status: status ?? raw.status,
      platforms: JSON.stringify(platforms ?? raw.platforms),
    };
    const slug = await generateSlug(UpdatedData.blog_title);

    await mysqlpool.query(
      `UPDATE blogs
       SET blog_title = ?, short_excerpt = ?, full_content = ?, featured_image = ?,
           category = ?, tags = ?, author = ?, publish_date = ?, reading_time = ?,
           related = ?, status = ?, platforms = ?, slug = ?
       WHERE id = ?`,
      [
        UpdatedData.blog_title,
        UpdatedData.short_excerpt,
        UpdatedData.full_content,
        UpdatedData.featured_image,
        UpdatedData.category,
        UpdatedData.tags,
        UpdatedData.author,
        UpdatedData.publish_date,
        UpdatedData.reading_time,
        UpdatedData.related,
        UpdatedData.status,
        UpdatedData.platforms,
        results[0].data.slug,
        id,
      ],
    );

    res.status(200).send({
      success: true,
      message: "Blog updated successfully",
      results,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

blogRouter.delete("/delete", authMiddleware, async (req, res) => {
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

    const platformData = await getPlatformsByIds(raw.platforms);

    const results = await Promise.all(
      platformData.map((platform) => deletePost(platform, raw.slug)),
    );

    // const failed = results.filter((r) => !r.success);

    // if (failed.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Platform delete failed",
    //     errors: failed,
    //   });
    // }

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
      message: error.message,
    });
  }
});

blogRouter.get("/recent", authMiddleware, async (req, res) => {
  try {
    const { days } = req.query;

    const limitDays = days || 7;

    const [rows] = await mysqlpool.query(
      `SELECT id,blog_title FROM blogs 
       WHERE created_at >= NOW() - INTERVAL ? DAY
       ORDER BY publish_date DESC`,
      [limitDays],
    );

    res.status(200).send({
      success: true,
      totalBlogs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

blogRouter.get("/filter", authMiddleware, async (req, res) => {
  try {
    const { status, platform, author, category, tags, search } = req.query;

    let query = `SELECT * FROM blogs WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (author) {
      query += ` AND author LIKE ?`;
      params.push(`%${author}%`);
    }

    if (category) {
      query += ` AND category LIKE ?`;
      params.push(`%${category}%`);
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim());
      tagArray.forEach((tag) => {
        query += ` AND JSON_SEARCH(tags, 'one', CONCAT('%', ?, '%')) IS NOT NULL`;
        params.push(tag);
      });
    }

    if (platform && platform !== "0") {
      query += ` AND JSON_CONTAINS(platforms, CAST(? AS JSON))`;
      params.push(platform);
    }

    if (search) {
      query += ` AND (
        blog_title LIKE ? 
        OR short_excerpt LIKE ?
        OR full_content LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await mysqlpool.query(query, params);

    res.status(200).send({
      success: true,
      totalBlogs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error filtering blogs:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

blogRouter.get("/platform", verifyApiKey, async (req, res) => {
  try {
    const { platformName } = req.query;

    if (!platformName) {
      return res.status(400).json({
        success: false,
        message: "Platform name required",
      });
    }

    const [blogs] = await mysqlpool.query(
      `
      SELECT 
        b.id,b.blog_title,b.short_excerpt,b.full_content,b.featured_image,b.author,b.publish_date,b.reading_time,b.status,b.slug,b.created_at,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name))
          FROM category c
          WHERE JSON_CONTAINS(b.category, CAST(c.id AS JSON))
        ) AS category_data,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name))
          FROM tags t
          WHERE JSON_CONTAINS(b.tags, CAST(t.id AS JSON))
        ) AS tag_data,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', rb.id, 'name', rb.blog_title))
          FROM blogs rb
          WHERE JSON_CONTAINS(b.related, CAST(rb.id AS JSON))
        ) AS related_data

      FROM blogs b
      JOIN platforms p2
        ON JSON_CONTAINS(b.platforms, CAST(p2.id AS JSON))

      WHERE REPLACE(REPLACE(LOWER(p2.platform_name), '\\n', ''), '\\r', '') = ? AND b.status = "publish"
      `,
      [platformName.trim().toLowerCase()],
    );

    const updatedBlogs = blogs.map((blog) => {
      const updated = {
        ...blog,
        featured_image: blog.featured_image
          ? BASE_URL + blog.featured_image
          : null,
        category: safeParse(blog.category_data),
        tags: safeParse(blog.tag_data),
        related: safeParse(blog.related_data),
      };

      delete updated.category_data;
      delete updated.tag_data;
      delete updated.related_data;

      return updated;
    });
    res.status(200).json({
      success: true,
      totalBlogs: updatedBlogs.length,
      data: updatedBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs by platform name", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

blogRouter.get("/slug", verifyApiKey, async (req, res) => {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug required",
      });
    }

    const [blogs] = await mysqlpool.query(
      `
      SELECT 
        b.id,b.blog_title,b.short_excerpt,b.full_content,b.featured_image,b.author,b.publish_date,b.reading_time,b.status,b.slug,b.created_at,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'name', c.name))
          FROM category c
          WHERE JSON_CONTAINS(b.category, CAST(c.id AS JSON))
        ) AS category_data,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name))
          FROM tags t
          WHERE JSON_CONTAINS(b.tags, CAST(t.id AS JSON))
        ) AS tag_data,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id', rb.id, 'name', rb.blog_title))
          FROM blogs rb
          WHERE JSON_CONTAINS(b.related, CAST(rb.id AS JSON))
        ) AS related_data

      FROM blogs b
      WHERE b.slug = ? AND b.status = "publish"
      `,
      [slug.trim()],
    );

    const updatedBlogs = blogs.map(
      ({ category_data, tag_data, related_data, ...rest }) => ({
        ...rest,
        featured_image: rest.featured_image
          ? BASE_URL + rest.featured_image
          : null,
        category: safeParse(category_data),
        tags: safeParse(tag_data),
        related: safeParse(related_data),
      }),
    );

    res.status(200).json({
      success: true,
      data: updatedBlogs[0],
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = blogRouter;
