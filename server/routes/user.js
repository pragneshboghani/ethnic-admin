const Router = require("express");
const mysqlpool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const userRouter = Router();

const adminUserName = process.env.ADMIN_USER_NAME;
const adminUserPassword = process.env.ADMIN_USER_PASSWORD;

userRouter.get("/all-author", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      "SELECT id, name, email, role, img_url FROM users",
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

userRouter.post("/create", async (req, res) => {
  try {
    const { name, email, password, role, profile_image } = req.body;

    console.log(req.body);

    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Name, Email, password and role are required",
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

    const [result] = await mysqlpool.query(
      "INSERT INTO users (name,email,password,role,img_url) VALUES (?,?,?,?,?)",
      [name, email, hashedPassword, role, profile_image],
    );

    const userId = result.insertId;

    res.status(201).send({
      success: true,
      message: "Author created successfully",
      user: {
        id: userId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// userRouter.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [[user]] = await mysqlpool.query(
//       "SELECT id,name,email,role,created_at FROM users WHERE id=?",
//       [id],
//     );

//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// userRouter.put("/update/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, role } = req.body;

//     const [result] = await mysqlpool.query(
//       `UPDATE users
//        SET name=?, email=?, role=?
//        WHERE id=?`,
//       [name, email, role, id],
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "User updated successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// userRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [result] = await mysqlpool.query("DELETE FROM users WHERE id=?", [
//       id,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).send({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });

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
      name: user.name
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
