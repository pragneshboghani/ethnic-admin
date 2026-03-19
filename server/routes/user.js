const Router = require("express");
const mysqlpool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const userRouter = Router();

userRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM users");

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

userRouter.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await mysqlpool.query(
      "SELECT id,name,email,role,created_at FROM users WHERE id=?",
      [id],
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

userRouter.post("/create", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Email, password and role are required",
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
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hashedPassword, role],
    );

    const userId = result.insertId;

    const token = jwt.sign(
      {
        id: userId,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).send({
      success: true,
      message: "User created successfully",
      token,
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

userRouter.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const [result] = await mysqlpool.query(
      `UPDATE users 
       SET name=?, email=?, role=? 
       WHERE id=?`,
      [name, email, role, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

userRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await mysqlpool.query("DELETE FROM users WHERE id=?", [
      id,
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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    const [[user]] = await mysqlpool.query(
      "SELECT * FROM users WHERE email=?",
      [email],
    );

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = userRouter;
