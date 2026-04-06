const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");

const seoRouter = Router();

seoRouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM seo_blog");
    res.status(200).send({
      success: true,
      totalSEOs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching SEOs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

seoRouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { blog_id, seo } = req.body;

    if (!blog_id || !Array.isArray(seo) || seo.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Missing blog_id or seo data",
      });
    }

    for (let i = 0; i < seo.length; i++) {
      const s = seo[i];
      await mysqlpool.query(
        `INSERT INTO seo_blog 
          (blog_id, platform_id, slug, publish_status, seo_title, meta_description, canonical_url, cta_button_text, cta_button_link) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          blog_id,
          s.platform_id,
          s.slug || "",
          s.publish_status || "draft",
          s.seo_title || "",
          s.meta_description || "",
          s.canonical_url || "",
          s.cta_button_text || "",
          s.cta_button_link || "",
        ],
      );
    }

    res.status(201).send({
      success: true,
      message: "SEO data added successfully",
    });
  } catch (error) {
    console.error("Error adding SEO data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

seoRouter.get("/getbyblog", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { blog_id, platform_id } = req.query;

    if (!blog_id || !platform_id) {
      return res.status(400).json({
        success: false,
        message: "Missing blog_id or platform_id",
      });
    }

    const [rows] = await mysqlpool.query(
      "SELECT * FROM seo_blog WHERE blog_id = ? AND platform_id = ?",
      [blog_id, platform_id],
    );
    res.status(200).send({
      success: true,
      totalSEOs: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching SEOs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

seoRouter.put("/update", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { blog_id, seo } = req.body;

    if (!blog_id || !Array.isArray(seo) || seo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing blog_id or seo data",
      });
    }

    for (let i = 0; i < seo.length; i++) {
      const s = seo[i];

      const [existing] = await mysqlpool.query(
        "SELECT id FROM seo_blog WHERE blog_id = ? AND platform_id = ?",
        [blog_id, s.platform_id],
      );

      if (existing.length > 0) {
        await mysqlpool.query(
          `UPDATE seo_blog 
           SET slug = ?, publish_status = ?, seo_title = ?, meta_description = ?, canonical_url = ?, cta_button_text = ?, cta_button_link = ?
           WHERE blog_id = ? AND platform_id = ?`,
          [
            s.slug || "",
            s.publish_status || "draft",
            s.seo_title || "",
            s.meta_description || "",
            s.canonical_url || "",
            s.cta_button_text || "",
            s.cta_button_link || "",
            blog_id,
            s.platform_id,
          ],
        );
      } else {
        await mysqlpool.query(
          `INSERT INTO seo_blog 
            (blog_id, platform_id, slug, publish_status, seo_title, meta_description, canonical_url, cta_button_text, cta_button_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            blog_id,
            s.platform_id,
            s.slug || "",
            s.publish_status || "draft",
            s.seo_title || "",
            s.meta_description || "",
            s.canonical_url || "",
            s.cta_button_text || "",
            s.cta_button_link || "",
          ],
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "SEO data updated successfully",
    });
  } catch (error) {
    console.error("Error updating SEO data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

seoRouter.delete("/delete", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const [[raw]] = await mysqlpool.query(`SELECT * FROM seo_blog WHERE blog_id = ?`, [
      id,
    ]);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "SEO not found",
      });
    }

    const [result] = await mysqlpool.query("DELETE FROM seo_blog WHERE id = ?", [
      raw.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "SEO not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "SEO deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SEO:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = seoRouter;
