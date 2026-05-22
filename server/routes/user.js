const Router = require("express");
const mysqlpool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { getPlatformsByIds } = require("../utils/platformHelper");
const postUserToPlatforms = require("../utils/postUserToPlatforms");
const deleteUserFromPlatform = require("../utils/deleteUserFromPlatform");

const userRouter = Router();

const adminUserName = process.env.ADMIN_USER_NAME;
const adminUserPassword = process.env.ADMIN_USER_PASSWORD;

const canManageAllUsers = (user) =>
  user?.role === "super_admin" || user?.role === "admin";

const canViewUser = (user) => Boolean(user?.id);

const canUpdateUser = (user, targetUser) => {
  if (Number(user?.id) === Number(targetUser?.id)) {
    return true;
  }

  return canManageAllUsers(user);
};

const canDeleteUser = (user, targetUser) =>
  user?.role === "super_admin" &&
  ["admin", "sub_admin"].includes(targetUser?.role);

const allowedRolesByUserRole = {
  super_admin: ["admin", "sub_admin"],
  admin: ["sub_admin"],
  sub_admin: [],
};

userRouter.get("/all-author", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      "SELECT id, name, email, role, img_url, description FROM users",
    );

    res.status(200).send({
      success: true,
      totalUsers: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      profile_image,
      description,
      admin_id,
      social_links,
      selectedPlatforms
    } = req.body;

    if (!canManageAllUsers(req.user)) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to create users",
      });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Name, Email, password and role are required",
      });
    }

    if (!allowedRolesByUserRole[req.user.role]?.includes(role)) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to create this role",
      });
    }

    const [[existingUser]] = await mysqlpool.query(
      "SELECT id FROM users WHERE email=?",
      [email],
    );

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const platformData = await getPlatformsByIds(req.body.selectedPlatforms);

    const results = await Promise.all(
      platformData.map((platform) => {
        return postUserToPlatforms(platform, req.body);
      }),
    );

    const platFormUserIds =[]
    for (const result of results) {
      const res = {
        platform_id: result.platform_id,
        user_id: result.data.id
      }
      platFormUserIds.push(res)
    }

    const [result] = await mysqlpool.query(
      "INSERT INTO users (name,email,password,role,img_url,description,platform_userId, selected_platforms, social_links) VALUES (?,?,?,?,?,?,?,?,?)",
      [name, email, hashedPassword, role, profile_image, description || "", JSON.stringify(platFormUserIds), JSON.stringify(selectedPlatforms), JSON.stringify(social_links)],
    );

    const userId = result.insertId;

    if (role === "admin") {
      const row = await mysqlpool.query(
        `INSERT INTO author_groups (name, members, created_by) VALUES (?, ?, ?)`,
        [name, JSON.stringify([]), userId],
      );
    }

    if (role === "sub_admin") {
      const [[row]] = await mysqlpool.query(
        `SELECT * FROM author_groups WHERE created_by = ?`,
        [admin_id],
      );

      const members = row.members;
      members.push(userId);

      const update = await mysqlpool.query(
        `UPDATE author_groups SET members = ? WHERE id = ?`,
        [JSON.stringify(members), row.id],
      );
    }

    res.status(201).send({
      success: true,
      message: "Author created successfully",
      user: {
        id: userId,
        name,
        email,
        role,
        description: description || "",
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/admin-list", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      `SELECT id, name, email, role FROM users WHERE role = 'admin'`,
    );

    res.status(200).send({
      success: true,
      totalUsers: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/sub-admin-list", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      `SELECT id, name, email, role FROM users WHERE role = 'sub_admin'`,
    );

    res.status(200).send({
      success: true,
      totalUsers: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/author/:authorId", authMiddleware, async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!canViewUser(req.user)) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to view this user",
      });
    }

    const [[user]] = await mysqlpool.query(
      `SELECT u.id, u.name, u.email, u.role, u.img_url AS profile_image, MAX(ag.created_by) AS admin_id, u.description,

      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ag.id,
          'name', ag.name,
          'created_by', ag.created_by,
          'members',
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', m.id,
                'name', m.name
              )
            )
            FROM users m
            WHERE JSON_CONTAINS(
              ag.members,
              CAST(m.id AS JSON),
              '$'
            )
          )
        )
      ) AS user_groups

  FROM users u

  LEFT JOIN author_groups ag
    ON (
      ag.created_by = u.id
      OR JSON_CONTAINS(
          ag.members,
          CAST(u.id AS JSON),
          '$'
      )
    )

  WHERE u.id = ?

  GROUP BY u.id`,
      [authorId],
    );

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.put("/update/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password, role, profile_image, description, members, selectedPlatforms, social_links } = req.body;

    if (!name || !email || !role) {
      return res.status(400).send({
        success: false,
        message: "Name, Email and role are required",
      });
    }

    const [[currentUser]] = await mysqlpool.query(
      "SELECT id, role FROM users WHERE id=?",
      [userId],
    );

    if (!canUpdateUser(req.user, currentUser)) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    if (!currentUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const canKeepCurrentRole = role === currentUser.role;
    const canAssignRole = allowedRolesByUserRole[req.user.role]?.includes(role);

    if (!canKeepCurrentRole && !canAssignRole) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to assign this role",
      });
    }

    const [[existingUser]] = await mysqlpool.query(
      "SELECT id FROM users WHERE email=? AND id<>?",
      [email, userId],
    );

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists with this email",
      });
    }

    const fields = [
      "name=?",
      "email=?",
      "role=?",
      "img_url=?",
      "description=?",
      "social_links=?",
    ];
    const values = [
      name,
      email,
      role,
      profile_image || null,
      description || "",
      JSON.stringify(social_links || {}),
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password=?");
      values.push(hashedPassword);
    }

    fields.push("selected_platforms=?");
    values.push(JSON.stringify(selectedPlatforms));
    const platformData = await getPlatformsByIds(selectedPlatforms);

    const results = await Promise.all(
      platformData.map((platform) => {
        return postUserToPlatforms(platform, req.body, userId);
      }),
    );

    const failedPlatforms = results.filter((item) => !item.success);

    if (failedPlatforms.length > 0) {
      return res.status(400).send({
        success: false,
        message: failedPlatforms.map((item) => item.message).join(", "),
        errors: failedPlatforms,
      });
    }

    const platFormUserIds =[]
    for (const result of results) {
      const res = {
        platform_id: result.platform_id,
        user_id: result.data.id
      }
      platFormUserIds.push(res)
    }

    if (platFormUserIds.length > 0) {
      fields.push("platform_userId=?");
      values.push(JSON.stringify(platFormUserIds));
    }

    values.push(userId);

    const [result] = await mysqlpool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id=?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const [[group]] = await mysqlpool.query(
      `SELECT id FROM author_groups WHERE created_by = ?`,
      [userId],
    );

    if (group) {
      const updatedMembers = Array.isArray(members) ? members.map(Number) : [];

      await mysqlpool.query(
        `UPDATE author_groups SET members = ? WHERE id = ?`,
        [JSON.stringify(updatedMembers), group.id],
      );
    }

    res.status(200).send({
      success: true,
      message: "Author updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.delete("/delete/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const [[targetUser]] = await mysqlpool.query(
      "SELECT id, role, selected_platforms, name FROM users WHERE id=?",
      [userId],
    );

    if (!targetUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (!canDeleteUser(req.user, targetUser)) {
      return res.status(403).send({
        success: false,
        message: "You are not allowed to delete this user",
      });
    }

    const platformData = await getPlatformsByIds(targetUser.selected_platforms) ;

    const results = await Promise.all(
      platformData.map((platform) => {
        return deleteUserFromPlatform(platform, targetUser);
      }),
    );

    if (targetUser.role === "admin") {
      const [[group]] = await mysqlpool.query(
        `SELECT id FROM author_groups WHERE created_by = ?`,
        [userId],
      );

      await mysqlpool.query(`DELETE FROM author_groups WHERE id = ?`, [
        group.id,
      ]);
    }

    if (targetUser.role === "sub_admin") {
      const [groups] = await mysqlpool.query(
        `SELECT id, members FROM author_groups WHERE JSON_CONTAINS(members, CAST(? AS JSON), '$')`,
        [targetUser.id],
      );

      for (const group of groups) {
        const members = group.members;
        const updatedMembers = members.filter(
          (member) => member != Number(userId),
        );

        await mysqlpool.query(
          `UPDATE author_groups SET members = ? WHERE id = ?`,
          [JSON.stringify(updatedMembers), group.id],
        );
      }
    }

    const [result] = await mysqlpool.query("DELETE FROM users WHERE id=?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      success: false,
      message: "Username and password are required",
    });
  }

  const [[user]] = await mysqlpool.query("SELECT * FROM users WHERE email=?", [
    username,
  ]);

  if (!user) {
    return res.status(404).send({
      success: false,
      message: "username or password is incorrect",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).send({
      success: false,
      message: "username or password is incorrect password",
    });
  }

  const token = jwt.sign(
    {
      email: username,
      role: user.role,
      id: user.id,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

module.exports = userRouter;
