const Router = require("express");
const mysqlpool = require("../config/db");

const PlatformRouter = Router();

PlatformRouter.get("/all", async (req, res) => {
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
      message: "Server Error",
    });
  }
});

PlatformRouter.get("/get", async (req, res) => {
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
      message: "Server Error",
    });
  }
});

PlatformRouter.get("/active", async (req, res) => {
  try {
    const [rows] = await mysqlpool.query(
      `SELECT * FROM platforms WHERE status = 'active'`,
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
      message: "Server Error",
    });
  }
});

PlatformRouter.post("/add", async (req, res) => {
  try {
    const { platform_name, website_url, api_endpoint, auth_token, status } =
      req.body;

    const [result] = await mysqlpool.query(
      `INSERT INTO platforms (platform_name, website_url, api_endpoint, auth_token, status) VALUES (?, ?, ?, ?, ?)`,
      [platform_name, website_url, api_endpoint, auth_token, status],
    );

    res.status(201).send({
      success: true,
      message: "platform added successfully",
      platformId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding platform:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

PlatformRouter.put("/update", async (req, res) => {
  try {
    const { id } = req.query;

    const { platform_name, website_url, api_endpoint, auth_token, status } =
      req.body;

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

    const UpdatedData = {
      platform_name: platform_name ?? raw.platform_name,
      website_url: website_url ?? raw.website_url,
      api_endpoint: api_endpoint ?? raw.api_endpoint,
      auth_token: auth_token ?? raw.auth_token,
      status: status ?? raw.status,
    };

    await mysqlpool.query(
      `UPDATE platforms SET platform_name = ?, website_url = ?, api_endpoint = ?, auth_token = ?, status = ?, updated_at = NOW() WHERE id = ?`,
      [
        UpdatedData.platform_name,
        UpdatedData.website_url,
        UpdatedData.api_endpoint,
        UpdatedData.auth_token,
        UpdatedData.status,
        id,
      ],
    );

    res.status(200).send({
      success: true,
      message: "Platform updated successfully",
    });
  } catch (error) {
    console.error("Error updating Platform:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

PlatformRouter.delete("/delete", async (req, res) => {
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
      message: "Server Error",
    });
  }
});

module.exports = PlatformRouter;
