const express = require("express");
const verifyApiKey = require("../middleware/verifyApiKey");
const authMiddleware = require("../middleware/authMiddleware");
const mysqlpool = require("../config/db");

const publishHistoryRouter = express.Router();

publishHistoryRouter.get(
  "/get_history",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      const { blogId, entityType, platformId } = req.query;

      if (!blogId) {
        return res.status(400).json({
          success: false,
          message: "blogId is required",
        });
      }

      let query = "SELECT * FROM blog_publish_history WHERE blog_id = ?";
      const params = [blogId];

      if (entityType) {
        query += " AND entity_type = ?";
        params.push(entityType);
      }

      if (platformId) {
        query += " AND platform_id = ?";
        params.push(platformId);
      }

      query += " ORDER BY created_at DESC, id DESC";

      const [data] = await mysqlpool.query(query, params);

      res.status(200).send({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
module.exports = publishHistoryRouter;
