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

    const [[blogExists]] = await mysqlpool.query(
      `SELECT id, platforms FROM blogs WHERE id = ?`,
      [blogId]
    );

    if (!blogExists) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const [comments] = await mysqlpool.query(
      `
      SELECT
          bc.id as comment_id,
          bc.comment,
          bc.comment_status,
          bc.commentor_email,
          bc.commentor_name,
          bc.created_at,
          p.platform_name,
          IF(
              COUNT(bcr.id) = 0,
              JSON_ARRAY(),
              JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'id', bcr.id,
                      'admin_reply', bcr.admin_reply,
                      'created_at', bcr.created_at,
                      'adminData', JSON_OBJECT(
                          'name', ru.name,
                          'img_url',
                          CONCAT(
                            '${BASE_URL}',
                            COALESCE(
                              NULLIF(ru.img_url, ''),
                                'media/uploads/1778838787732-71l6q3owugj.jpeg'
                            )
                          )
                      )
                  )
              )
          ) AS replies
      FROM blog_comment bc
      LEFT JOIN platforms p
          ON bc.platform_id = p.id
      LEFT JOIN blog_comment_replies bcr
          ON bc.id = bcr.comment_id
      LEFT JOIN users ru
          ON bcr.admin_id = ru.id
      WHERE bc.blog_id = ?
      GROUP BY
          bc.id,
          bc.comment,
          bc.comment_status,
          bc.commentor_email,
          bc.commentor_name,
          bc.created_at,
          p.platform_name
      ORDER BY bc.created_at DESC
      `,
      [blogId]
    );

    res.status(200).json({
      success: true,
      commentData: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

blogCommentRouter.get("/comment/get/all", verifyApiKey, authMiddleware, async (req, res) => {
    try { 
      const [blogIdsResult] = await mysqlpool.query(`SELECT id FROM blogs`);
      const blogIds = blogIdsResult.map(item => item.id);

      const [comment] = await mysqlpool.query(
        `SELECT
              platform_name,
              JSON_ARRAYAGG(comment_data) AS comments
          FROM (
              SELECT
                  p.platform_name,
                  JSON_OBJECT(
                      'comment_id', bc.id,
                      'blog_id', bc.blog_id,
                      'comment', bc.comment,
                      'commentor_name', bc.commentor_name,
                      'commentor_email', bc.commentor_email,
                      'comment_status', bc.comment_status,
                      'created_at', bc.created_at,
                      'platform_id', bc.platform_id,
                      'updated_by', bc.updated_by,
                      'blog_title', b.blog_title,

                      'status_updated_by',
                      JSON_OBJECT(
                          'name', su.name,
                          'img_url',
                          CONCAT(
                              '${BASE_URL}',
                              COALESCE(
                              NULLIF(su.img_url, ''),
                                'media/uploads/1778838787732-71l6q3owugj.jpeg'
                            )
                          )
                      ),
                      'replies',
                      COALESCE(
                          (
                              SELECT JSON_ARRAYAGG(
                                  JSON_OBJECT(
                                      'id', bcr.id,
                                      'admin_id', bcr.admin_id,
                                      'admin_reply', bcr.admin_reply,

                                      'adminData',
                                      JSON_OBJECT(
                                          'name', ru.name,
                                          'img_url',
                                          CONCAT(
                                              '${BASE_URL}',
                                              COALESCE(
                                                NULLIF(ru.img_url, ''),
                                                  'media/uploads/1778838787732-71l6q3owugj.jpeg'
                                              )
                                          )
                                      )
                                  )
                              )
                              FROM blog_comment_replies bcr
                              LEFT JOIN users ru
                                  ON bcr.admin_id = ru.id
                              WHERE bcr.comment_id = bc.id
                          ),
                          JSON_ARRAY()
                      )
                  ) AS comment_data
              FROM blog_comment bc
              JOIN blogs b
                  ON bc.blog_id = b.id
              LEFT JOIN users su
                  ON bc.updated_by = su.id
              LEFT JOIN platforms p
                  ON bc.platform_id = p.id
              WHERE bc.blog_id IN (?)
          ) grouped_comments
          GROUP BY platform_name
          ORDER BY platform_name;`, [blogIds]
      );
      
      // const platformCommentsMap = {};

      // await Promise.all(
      //   platforms.map(async (platform) => {
      //     try {
      //       const url = getTaxonomyUrl(platform, "comment");
      //       const headers = getAuthHeaders(platform);

      //       const commentRes = await axios.get(
      //         `${url}?post=${platform.platform_blog_id}&status=all`,
      //         { headers }
      //       );

      //       if (!platformCommentsMap[platform.platform_name]) {
      //         platformCommentsMap[platform.platform_name] = {
      //           platform_name: platform.platform_name,
      //           comments: [],
      //         };
      //       }

      //       const commentData = commentRes.data;

      //       if (Array.isArray(commentData)) {
      //         const comments = commentData.map((item) => ({
      //           id: Number(`${item.id}${item.post}`),
      //           comment: item.content?.rendered || "",
      //           blog_title: platform.blog_title,
      //           created_at: item.date || null,
      //           comment_status: item.status,
      //           commentor_name: item.author_name || "Anonymous",
      //           commentor_email: item.author_url || "",
      //         }));

      //         platformCommentsMap[platform.platform_name].comments.push(...comments);
      //       }
      //     } catch (error) {
      //       console.error(error);
      //     }
      //   })
      // );

      // const externalComments = Object.values(platformCommentsMap);

      // comment.push(...externalComments);

      res.status(200).send({
        success: true,
        data: comment,
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

    const [existingComments] = await mysqlpool.query(
      `SELECT id, updated_by FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (existingComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const [result] = await mysqlpool.query(
      `UPDATE blog_comment SET comment_status = ?, updated_by = ? WHERE id = ?`,
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

    const [existingComments] = await mysqlpool.query(
      `SELECT id, blog_id FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (existingComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const [[existingReplies]] = await mysqlpool.query(
      `SELECT admin_reply FROM blog_comment_replies WHERE comment_id = ? AND admin_id = ?`,
      [commentId, adminId]
    )

    if (existingReplies && existingReplies?.admin_reply) {
      await mysqlpool.query(
        `UPDATE blog_comment_replies SET admin_reply = ? WHERE comment_id = ? AND admin_id = ?`,
        [adminReply, commentId, adminId],
      );

      return res.status(200).json({
        success: true,
        message: "Reply updated successfully",
        replyerAdmin: adminId,
      });
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO blog_comment_replies (comment_id, admin_id, admin_reply, blog_id) VALUES (?, ?, ?, ?)`,
      [commentId, adminId, adminReply, existingComments[0].blog_id],
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

    const [comments] = await mysqlpool.query(
      `SELECT 
          bc.id,
          bc.comment,
          bc.comment_status,
          bc.commentor_email,
          bc.commentor_name,
          bc.created_at,

          JSON_OBJECT(
              'name', su.name,
              'img_url',
              CONCAT(
                  '${BASE_URL}',
                  COALESCE(
                    NULLIF(su.img_url, ''),
                      'media/uploads/1778838787732-71l6q3owugj.jpeg'
                  )
              )
          ) AS status_updated_by,

          IF(
              COUNT(bcr.id) = 0,
              JSON_ARRAY(),
              JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'admin_reply', bcr.admin_reply,
                      'adminData', JSON_OBJECT(
                          'name', ru.name,
                          'img_url',
                          CONCAT(
                              '${BASE_URL}',
                              COALESCE(
                                  NULLIF(ru.img_url, ''),
                                  'media/uploads/1778838787732-71l6q3owugj.jpeg'
                              )
                          )
                      )
                  )
              )
          ) AS replies

      FROM blog_comment bc

      LEFT JOIN users su
          ON bc.updated_by = su.id

      LEFT JOIN blog_comment_replies bcr
          ON bc.id = bcr.comment_id

      LEFT JOIN users ru
          ON bcr.admin_id = ru.id

      WHERE bc.platform_id = ?
        AND bc.blog_id = ?
        AND bc.comment_status = 'approved'

      GROUP BY
          bc.id,
          bc.comment,
          bc.comment_status,
          bc.commentor_email,
          bc.commentor_name,
          bc.created_at,
          su.name,
          su.img_url

      ORDER BY bc.created_at DESC`,
      [platformId.id, blogId]
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

blogCommentRouter.delete("/comment/delete/:commentId", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;

    const [[row]] = await mysqlpool.query(
      `SELECT id FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    
    const [result] = await mysqlpool.query(
      `DELETE FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = blogCommentRouter;
