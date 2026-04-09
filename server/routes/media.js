const Router = require("express");
const mysqlpool = require("../config/db");
const saveBase64File = require("../utils/saveBase64File");
const authMiddleware = require("../middleware/authMiddleware");
const postMediaToPlateform = require("../utils/postMediaToPlateform");
const { getPlatformsByIds } = require("../utils/platformHelper");
const verifyApiKey = require("../middleware/verifyApiKey");

const mediarouter = Router();

mediarouter.get("/all", verifyApiKey, authMiddleware, async (req, res) => {
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
      message: error.message,
    });
  }
});

mediarouter.post("/add", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { file, alt, selectedPlatforms } = req.body;

    const { filepath, mimeType, fileSize, filename } = saveBase64File(
      file,
      "uploads",
    );

    const type = mimeType.startsWith("image") ? "image" : "video";

    const platformData = await getPlatformsByIds(selectedPlatforms);

    let results = [];

    if (platformData.length > 0) {
      results = await Promise.all(
        platformData.map((platform) =>
          postMediaToPlateform(platform, req.body),
        ),
      );
    }

    const platformJson = results
      .filter((r) => r && r.mediaId && r.url)
      .map((r) => ({
        id: r.mediaId,
        url: r.url,
        platformId: r.platformId,
      }));

    const [result] = await mysqlpool.query(
      `INSERT INTO media
      (file_name,file_url,file_type,mime_type,file_size,alt_text,platforms)
      VALUES (?,?,?,?,?,?,?)`,
      [filename, filepath, type, mimeType, fileSize, alt || null, JSON.stringify(platformJson)],
    );

    res.send({
      success: true,
      message: "File uploaded successfully",
      mediaId: result.insertId,
      fileUrl: filepath,
      platformResults: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

mediarouter.get("/filter", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;

    let query = `SELECT * FROM media WHERE 1=1`;
    const params = [];

    if (type && type !== "all") {
      query += ` AND file_type = ?`;
      params.push(type);
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
      message: error.message,
    });
  }
});

mediarouter.put("/update-alt/:mediaId", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { alt_text } = req.body;

    if (!alt_text) {
      return res.status(400).send({
        success: false,
        message: "alt_text is required",
      });
    }

    const [[media]] = await mysqlpool.query(
      "SELECT * FROM media WHERE id = ?",
      [mediaId],
    );

    if (!media) {
      return res.status(404).send({
        success: false,
        message: "Media not found",
      });
    }

    await mysqlpool.query("UPDATE media SET alt_text = ? WHERE id = ?", [
      alt_text,
      mediaId,
    ]);

    res.status(200).send({
      success: true,
      message: "Alt text updated successfully",
      mediaId: mediaId,
      newAltText: alt_text,
    });
  } catch (error) {
    console.error("Error updating alt text:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

mediarouter.delete("/delete", verifyApiKey, authMiddleware, async (req, res) => {
  try {
    const { id } = req.query;

    const [[media]] = await mysqlpool.query(
      "SELECT * FROM media WHERE id = ?",
      [id],
    );
    if (!media) {
      return res.status(404).send({
        success: false,
        message: "Media not found",
      });
    }

    await mysqlpool.query("DELETE FROM media WHERE id = ?", [id]);

    res.status(200).send({
      success: true,
      message: "Media deleted successfully",
      mediaId: id,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = mediarouter;
