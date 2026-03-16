const Router = require("express");
const mysqlpool = require("../config/db");
const saveBase64File = require("../utils/saveBase64File");
const authMiddleware = require("../middleware/authMiddleware");

const Mediarouter = Router();

Mediarouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const [rows] = await mysqlpool.query("SELECT * FROM media");
    res.status(200).send({
      success: true,
      totalImages: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

Mediarouter.post("/add", authMiddleware, async (req, res) => {
  try {
    const { file, alt } = req.body;

    const { filepath, mimeType, fileSize, filename } = saveBase64File(
      file,
      "uploads",
    );

    const type = mimeType.startsWith("image") ? "image" : "video";

    const [result] = await mysqlpool.query(
      `INSERT INTO media 
      (file_name,file_url,file_type,mime_type,file_size,alt_text)
      VALUES (?,?,?,?,?,?)`,
      [filename, filepath, type, mimeType, fileSize, alt || null],
    );

    res.send({
      success: true,
      message: "File uploaded successfully",
      mediaId: result.insertId,
      fileUrl: filepath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

Mediarouter.get("/filter", authMiddleware, async (req, res) => {
  try {
    const { type, search } = req.query;

    let query = `SELECT * FROM media WHERE 1=1`;
    const params = [];

    if (type && type !== "all") {
      query += ` AND file_type = ?`;
      params.push(type);
    }

    if (search) {
      query += ` AND (
        file_name LIKE ?
        OR alt_text LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await mysqlpool.query(query, params);

    res.status(200).send({
      success: true,
      totalMedia: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error filtering media:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = Mediarouter;
