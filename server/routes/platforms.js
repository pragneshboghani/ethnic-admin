const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const platformRouter = Router();

platformRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM platforms");
    res.status(200).send({
      success: true,
      totalPlatforms: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

platformRouter.get("/get", authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const [rows] = await mysqlpool.query(
      "SELECT * FROM platforms WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    res.status(200).send({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

platformRouter.get("/active", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      `SELECT id,platform_name,website_url FROM platforms WHERE status = 'active'`,
    );

    res.status(200).send({
      success: true,
      totalPlatforms: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching active platforms:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

platformRouter.post("/add", authMiddleware, async (req, res) => {
  try {
    const { platform_name, website_url, api_endpoint, plateform_type, auth_type, auth_token, username, password, status } = req.body;

    if (!platform_name || !website_url || !auth_type) {
      return res.status(400).json({
        success: false,
        message: "platform_name, website_url, auth_type are required",
      });
    }

    if (auth_type === "token" && !auth_token) {
      return res.status(400).json({
        success: false,
        message: "Auth token is required for token type",
      });
    }

    if (auth_type === "basic" && (!username || !password)) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required for basic auth",
      });
    }

    let finalAuthToken = null;
    let finalUsername = null;
    let finalPassword = null;

    if (auth_type === "token") {
      finalAuthToken = auth_token;
    }

    if (auth_type === "basic") {
      finalUsername = username;
      finalPassword = password;
    }

    const [result] = await mysqlpool.query(
      `INSERT INTO platforms 
      (platform_name, website_url, plateform_type, api_endpoint, auth_type, auth_token, username, password, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        platform_name,
        website_url,
        plateform_type,
        api_endpoint,
        auth_type,
        finalAuthToken,
        finalUsername,
        finalPassword,
        status || "Active",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Platform added successfully",
      platformId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding platform:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

platformRouter.put("/update", authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const {
      platform_name,
      website_url,
      plateform_type,
      api_endpoint,
      auth_type,
      auth_token,
      username,
      password,
      status,
    } = req.body;

    const [[raw]] = await mysqlpool.query(
      `SELECT * FROM platforms WHERE id = ?`,
      [id],
    );

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    if (auth_type === "token" && !auth_token) {
      return res.status(400).json({
        success: false,
        message: "Auth token is required for token type",
      });
    }

    if (auth_type === "basic" && (!username || !password)) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required for basic auth",
      });
    }

    let finalAuthType = auth_type && auth_type !== "" ? auth_type : raw.auth_type;

    let finalAuthToken = null;
    let finalUsername = null;
    let finalPassword = null;

    if (finalAuthType === "token") {
      finalAuthToken = auth_token ?? raw.auth_token;
    }

    if (finalAuthType === "basic") {
      finalUsername = username ?? raw.username;
      finalPassword = password ?? raw.password;
    }

    const UpdatedData = {
      platform_name: platform_name ?? raw.platform_name,
      website_url: website_url ?? raw.website_url,
      plateform_type: plateform_type ?? raw.plateform_type,
      api_endpoint: api_endpoint ?? raw.api_endpoint,
      auth_type: finalAuthType,
      auth_token: finalAuthToken,
      username: finalUsername,
      password: finalPassword,
      status: status ?? raw.status,
    };

    await mysqlpool.query(
      `UPDATE platforms 
       SET platform_name = ?, website_url = ?, plateform_type= ?, api_endpoint = ?, 
           auth_type = ?, auth_token = ?, username = ?, password = ?, 
           status = ?
       WHERE id = ?`,
      [
        UpdatedData.platform_name,
        UpdatedData.website_url,
        UpdatedData.plateform_type,
        UpdatedData.api_endpoint,
        UpdatedData.auth_type,
        UpdatedData.auth_token,
        UpdatedData.username,
        UpdatedData.password,
        UpdatedData.status,
        id,
      ],
    );

    res.status(200).json({
      success: true,
      message: "Platform updated successfully",
    });
  } catch (error) {
    console.error("Error updating platform:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

platformRouter.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const [[raw]] = await mysqlpool.query(
      `SELECT * FROM platforms WHERE id = ?`,
      [id],
    );

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    const [result] = await mysqlpool.query(
      "DELETE FROM platforms WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Platform not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Platform deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Platform:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = platformRouter;
