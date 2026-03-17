const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const SEORouter = Router();

SEORouter.get("/all", authMiddleware, async (req, res) => {
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

SEORouter.post("/add", authMiddleware, async (req, res) => {
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

module.exports = SEORouter;
