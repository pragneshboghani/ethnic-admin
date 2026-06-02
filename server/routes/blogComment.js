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
            admins_reply: null,
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
        admins_reply: comment.admins_reply,
        platform_name: comment.platform_name || "Unknown Platform",
      })));

      const comments = await Promise.all(
        blogComments.map(async (comment) => {
          if (comment.admins_reply && comment.admins_reply.length > 0) {          
            const adminsReply = await Promise.all(
              comment.admins_reply.map(async (reply) => {
                const [[admin]] = await mysqlpool.query(
                  `SELECT name, img_url FROM users WHERE id = ?`,
                  [reply.adminId]
                );

                delete reply.adminId;
                return {...reply,
                  adminData: {
                    ...admin,
                    img_url: `${BASE_URL}${
                      admin?.img_url ||
                      "media/uploads/1778838787732-71l6q3owugj.jpeg"
                    }`,
                  },
                };
              })
            );

            comment.admins_reply = adminsReply;
          }

          return comment;
        })
      );
      res.status(200).send({
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
  }
);

blogCommentRouter.get("/comment/get/all", verifyApiKey, authMiddleware, async (req, res) => {
    try { 
      const [blogIdsResult] = await mysqlpool.query(`SELECT id FROM blogs`);
      const blogIds = blogIdsResult.map(item => item.id);

      const [[comment], [platforms]] = await Promise.all([
        mysqlpool.query(`SELECT
            p.platform_name,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', bc.id,
                    'comment', bc.comment,
                    'commentor_name', bc.commentor_name,
                    'commentor_email', bc.commentor_email,
                    'comment_status', bc.comment_status,
                    'blog_title', b.blog_title,
                    'created_at', bc.created_at,
                    'admins_reply',
                      COALESCE(
                          (
                              SELECT JSON_ARRAYAGG(
                                  JSON_OBJECT(
                                      'type', jt.type,
                                      'replied_at', jt.replied_at,
                                      'admin_reply', jt.admin_reply,
                                      'adminData',
                                      JSON_OBJECT(
                                          'name', u.name,
                                          'img_url',
                                          CONCAT(
                                              '${BASE_URL}',
                                              COALESCE(
                                                  u.img_url,
                                                  'media/uploads/1778838787732-71l6q3owugj.jpeg'
                                              )
                                          )
                                      )
                                  )
                              )
                              FROM JSON_TABLE(
                                  bc.admins_reply,
                                  '$[*]'
                                  COLUMNS (
                                      adminId INT PATH '$.adminId',
                                      type VARCHAR(50) PATH '$.type',
                                      replied_at VARCHAR(100) PATH '$.replied_at',
                                      admin_reply TEXT PATH '$.admin_reply'
                                  )
                              ) jt
                              LEFT JOIN users u
                                  ON u.id = jt.adminId
                              ORDER BY jt.replied_at DESC    
                          ),
                          JSON_ARRAY()
                      )
                )
            ) AS comments
        FROM blog_comment bc
        JOIN blogs b
          ON bc.blog_id = b.id
        LEFT JOIN platforms p
            ON p.id = bc.platform_id
        WHERE bc.blog_id IN (?)
        GROUP BY p.platform_name;`, [blogIds]),
        mysqlpool.query(`SELECT b.id, b.blog_title, b.platforms, sb.platform_id, sb.platform_blog_id, p.* FROM blogs b 
          JOIN seo_blog sb ON b.id = sb.blog_id
          JOIN platforms p ON sb.platform_id = p.id
          WHERE b.id IN (?) AND sb.platform_blog_id IS NOT NULL`, [blogIds])
      ]);
      
      const platformCommentsMap = {};

      await Promise.all(
        platforms.map(async (platform) => {
          try {
            const url = getTaxonomyUrl(platform, "comment");
            const headers = getAuthHeaders(platform);

            const commentRes = await axios.get(
              `${url}?post=${platform.platform_blog_id}&status=all`,
              { headers }
            );

            if (!platformCommentsMap[platform.platform_name]) {
              platformCommentsMap[platform.platform_name] = {
                platform_name: platform.platform_name,
                comments: [],
              };
            }

            const commentData = commentRes.data;

            if (Array.isArray(commentData)) {
              const comments = commentData.map((item) => ({
                id: Number(`${item.id}${item.post}`),
                comment: item.content?.rendered || "",
                blog_title: platform.blog_title,
                created_at: item.date || null,
                comment_status: item.status,
                commentor_name: item.author_name || "Anonymous",
                commentor_email: item.author_url || "",
              }));

              platformCommentsMap[platform.platform_name].comments.push(...comments);
            }
          } catch (error) {
            console.error(error);
          }
        })
      );

      const externalComments = Object.values(platformCommentsMap);

      comment.push(...externalComments);

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
      INSERT INTO blog_comment (blog_id, platform_id, commentor_name, commentor_email, comment_status,admins_reply, comment) VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [blogId, platformId.id, authorName, authorEmail, 'hold', JSON.stringify([]), content]);

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
      `SELECT id, admins_reply FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (existingComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const adminReply = existingComments[0].admins_reply;    
    const alreadyStatusChange = adminReply.some(reply => reply.type === "status_change");
    
    const newAdminReply = [];

    if (alreadyStatusChange) {
      const excludeReply = adminReply.filter(reply => reply.type !== "status_change");
      newAdminReply.push(...excludeReply);
      const reply = adminReply.find(reply => reply.type === "status_change");
      reply.adminId = adminId;
      reply.replied_at = new Date();
      newAdminReply.push(reply);
    } else {
      const replyerAdmin = {
        adminId: adminId,
        replied_at: new Date(),
        type: "status_change",
      }
  
      newAdminReply.push(replyerAdmin);
    };

    const [result] = await mysqlpool.query(
      `UPDATE blog_comment SET comment_status = ?, admins_reply = ? WHERE id = ?`,
      [status, JSON.stringify(newAdminReply), commentId],
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
      `SELECT id, admins_reply FROM blog_comment WHERE id = ?`,
      [commentId],
    );

    if (existingComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const adminReplys = existingComments[0].admins_reply;  

    const alreadyReply = adminReplys.some(reply => reply.type === "reply" && reply.adminId === adminId);
    
    const newAdminReply = [];

    const excludeReply = adminReplys.filter(reply => !(reply.type === "reply" && reply.adminId === adminId));
    newAdminReply.push(...excludeReply);

    if (alreadyReply) {
      const reply = adminReplys.find(reply => reply.type === "reply" && reply.adminId === adminId);
      reply.replied_at = new Date();
      reply.admin_reply = adminReply;
      newAdminReply.push(reply);
    } else {
      const replyerAdmin = {
        adminId: adminId,
        replied_at: new Date(),
        type: "reply",
        admin_reply: adminReply
      }
  
      newAdminReply.push(replyerAdmin);
    };

    const [result] = await mysqlpool.query(
      `UPDATE blog_comment SET admins_reply = ? WHERE id = ?`,
      [JSON.stringify(newAdminReply), commentId],
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
      `SELECT id, comment, comment_status, commentor_email, commentor_name, admins_reply, created_at FROM blog_comment WHERE platform_id = ? AND blog_id = ? AND comment_status = 'approved' ORDER BY created_at DESC`,
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
        if (comment.admins_reply && comment.admins_reply.length > 0) {          
          const adminsReply = await Promise.all(
            comment.admins_reply.map(async (reply) => {
              const [[admin]] = await mysqlpool.query(
                `SELECT name, img_url FROM users WHERE id = ?`,
                [reply.adminId]
              );

              delete reply.adminId;
              return {...reply,
                adminData: {
                  ...admin,
                  img_url: `${BASE_URL}${
                    admin?.img_url ||
                    "media/uploads/1778838787732-71l6q3owugj.jpeg"
                  }`,
                },
              };
            })
          );

          comment.admins_reply = adminsReply;
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
