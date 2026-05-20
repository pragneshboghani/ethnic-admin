const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");

const groupRouter = Router();

const canManageGroups = (user) =>
  user?.role === "super_admin" || user?.role === "admin";

groupRouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(`
      SELECT 
        ag.id,
        ag.created_by,
        ag.members AS member_ids,
        ag.name AS group_name,
        creator.img_url AS image,
        creator.role,
        creator.name,
        JSON_ARRAYAGG(
          CASE 
            WHEN member.id IS NOT NULL THEN member.name
          END
        ) AS members
      FROM author_groups ag
      LEFT JOIN users creator 
        ON creator.id = ag.created_by
      LEFT JOIN JSON_TABLE(
        ag.members,
        '$[*]' COLUMNS (
          member_id INT PATH '$'
        )
      ) jt
        ON TRUE
      LEFT JOIN users member
        ON member.id = jt.member_id
      GROUP BY ag.id
    `);

    const parsedRows = rows.map((group) => ({
      ...group,
      members: (typeof group.members === "string"
        ? JSON.parse(group.members)
        : group.members
      ).filter(Boolean),
    }));

    res.status(200).send({
      success: true,
      totalGroups: parsedRows.length,
      data: parsedRows,
    });
  } catch (error) {
    console.error("Error fetching Groups:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

groupRouter.get("/get", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const [rows] = await mysqlpool.query(
      "SELECT * FROM author_groups WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    res.status(200).send({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching Group:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

groupRouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { name, description, image, members } = req.body;
    const userId = req.user.id;

    if (!canManageGroups(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create groups",
      });
    }

    const memberIds = (members || [])
      .map((memberId) => Number(memberId))
      .filter((memberId) => memberId && memberId !== Number(userId));

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO author_groups (name, members, created_by) VALUES (?, ?, ?)`,
      [name, JSON.stringify(memberIds), userId],
    );

    res.status(201).json({
      success: true,
      message: "Group added successfully",
      groupId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding Group:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

groupRouter.put("/update", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    const { name, description, image, members } = req.body;

    if (!canManageGroups(req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update groups",
      });
    }

    const [[raw]] = await mysqlpool.query(
      `SELECT * FROM author_groups WHERE id = ?`,
      [id],
    );

    if (!raw) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const UpdatedData = {
      name: name ?? raw.name,
      description: description ?? raw.description,
      image: image ?? raw.image,
      members:
        members !== undefined
          ? JSON.stringify(
              (members || [])
                .map((memberId) => Number(memberId))
                .filter(
                  (memberId) => memberId && memberId !== Number(raw.created_by),
                ),
            )
          : raw.members,
    };

    await mysqlpool.query(
      `UPDATE author_groups SET name = ?, members = ? WHERE id = ?`,
      [UpdatedData.name, UpdatedData.members, id],
    );

    res
      .status(200)
      .json({ success: true, message: "Group updated successfully" });
  } catch (error) {
    console.error("Error updating Group:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

groupRouter.delete(
  "/delete",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!canManageGroups(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete groups",
        });
      }

      const [[raw]] = await mysqlpool.query(
        `SELECT * FROM author_groups WHERE id = ?`,
        [id],
      );

      if (!raw) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found" });
      }

      const [result] = await mysqlpool.query(
        "DELETE FROM author_groups WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Group deleted successfully" });
    } catch (error) {
      console.error("Error deleting Group:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = groupRouter;
