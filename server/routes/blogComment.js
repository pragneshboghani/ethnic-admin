const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");
const { getPlatformsByIds } = require("../utils/platformHelper");
const getTaxonomyUrl = require("../utils/getTaxonomyUrl");
const axios = require("axios");
const getAuthHeaders = require("../utils/getAuthHeaders");

const blogCommentRouter = Router();

const allowedStatuses = ["hold", "approved", "rejected"];
const BASE_URL = process.env.BACKEND_API;

blogCommentRouter.get("/comment/get", verifyApiKey, authMiddleware, async (req, res) => {
    try {
      const { blogId } = req.query;

      const [[blogExists]] = await mysqlpool.query(`SELECT id, platforms FROM blogs WHERE id = ?`, [blogId]);

      if (!blogExists) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const blogComments = [];
      const platformData = await getPlatformsByIds(blogExists.platforms);

      const results = await Promise.all(
        platformData.map(async(platform) => {
          const [[platformBlogId]] = await mysqlpool.query(
            `SELECT id, platform_blog_id FROM seo_blog WHERE blog_id = ? AND platform_id = ?`,
            [blogId, platform.id]
          );

          const url = getTaxonomyUrl(platform, "comment");
          const headers = getAuthHeaders(platform);
          
          const commentRes = await axios.get(`${url}?post=${platformBlogId?.platform_blog_id}`, {
            headers,
          });

          const commentData = commentRes.data.map(comment => ({
            id: comment.id,
            comment: comment.content?.rendered || "",
            comment_status: comment.status || "approved",
            commentor_email: comment.author_email || "",
            commentor_name: comment.author_name || "Anonymous",
            created_at: comment.date || null,
            admin_reply: null,
            platform_name: platform.platform_name,
          }));

          blogComments.push(...commentData);
        }),
      );

      const [result] = await mysqlpool.query(
        `SELECT bc.*, p.platform_name
        FROM blog_comment bc
        LEFT JOIN platforms p 
          ON bc.platform_id = p.id
        WHERE bc.blog_id = ?;
        `,
        [blogId]
      );

      blogComments.push(...result.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        comment_status: comment.comment_status,
        commentor_email: comment.commentor_email,
        commentor_name: comment.commentor_name,
        created_at: comment.created_at,
        admin_reply: comment.admin_reply,
        platform_name: comment.platform_name || "Unknown Platform",
      })));

      res.status(200).send({
        success: true,
        commentData: blogComments,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

blogCommentRouter.post("/comment/add", verifyApiKey, async (req, res) => {
  try {
    const { blogId, authorName, authorEmail, content } = req.body;
    const { platform } = req.query;

    if (!blogId || !authorName || !authorEmail ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const [[platformId]] = await mysqlpool.query(`SELECT id FROM platforms WHERE REPLACE(REPLACE(LOWER(platform_name), '\\n', ''), '\\r', '') = ?`, [platform.trim().toLowerCase()]);

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform",
      });
    }

    const [result] = await mysqlpool.query(`
      INSERT INTO blog_comment (blog_id, platform_id, commentor_name, commentor_email, comment_status, comment) VALUES (?, ?, ?, ?, ?, ?);
    `, [blogId, platformId.id, authorName, authorEmail, 'hold', content]);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to add comment",
      });
    }

    res.status(200).send({
      success: true,
      message: "Comment added successfully. Once we have the comment moderation system in place, the comment will be visible after approval.",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

blogCommentRouter.put("/comment/status", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { commentId, status } = req.body;
    const adminId = req.user?.id;

    if (!commentId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing comment ID or status",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment status",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const [result] = await mysqlpool.query(
      `UPDATE blog_comment SET comment_status = ?, replyer_admin = ? WHERE id = ?`,
      [status, adminId, commentId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment status updated successfully",
      replyerAdmin: adminId,
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

blogCommentRouter.put("/comment/reply", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { commentId, adminReply } = req.body;
    const adminId = req.user?.id;

    if (!commentId || adminReply == null) {
      return res.status(400).json({
        success: false,
        message: "Missing comment ID or reply text",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const [result] = await mysqlpool.query(
      `UPDATE blog_comment SET admin_reply = ?, replyer_admin = ? WHERE id = ?`,
      [adminReply, adminId, commentId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply saved successfully",
      replyerAdmin: adminId,
    });
  } catch (error) {
    console.error("Error saving admin reply:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

blogCommentRouter.get("/comment/platform", verifyApiKey, async (req, res) => {
  try {
    const { platform, blogId } = req.query;

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Missing platform",
      });
    }

    const [[platformId]] = await mysqlpool.query(`SELECT id FROM platforms WHERE REPLACE(REPLACE(LOWER(platform_name), '\\n', ''), '\\r', '') = ?`, [platform.trim().toLowerCase()]);

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform",
      });
    }

    const [result] = await mysqlpool.query(
      `SELECT id, admin_reply, comment, comment_status, commentor_email, commentor_name, replyer_admin, created_at FROM blog_comment WHERE platform_id = ? AND blog_id = ? AND comment_status = 'approved' ORDER BY created_at DESC`,
      [platformId.id, blogId],
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comments not found for the specified platform and blog",
      });
    }

    const comments = await Promise.all(
      result.map(async (comment) => {
        if (comment.replyer_admin) {
          const [[admin]] = await mysqlpool.query(
            `SELECT name, img_url FROM users WHERE id = ?`,
            [comment.replyer_admin]
          );

          const adminData = {
            ...admin,
            img_url: `${BASE_URL}${
              admin?.img_url || "media/uploads/1778838787732-71l6q3owugj.jpeg"
            }`,
          };

          return { ...comment, admin: adminData };
        }

        return comment;
      })
    );

    res.status(200).json({
      success: true,
      message: "Comments found successfully",
      comments: comments
    });
  } catch (error) {
    console.error("Error finding Comments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = blogCommentRouter;
