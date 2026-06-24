const Router = require("express");
const fs = require("fs");
const path = require("path");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const verifyApiKey = require("../middleware/verifyApiKey");
const generateSlug = require("../utils/generateSlug");
const saveResourceFile = require("../utils/saveResourceFile");

const resourceRouter = Router();

const canManageResources = (user) =>
  user?.role === "super_admin" || user?.role === "admin";

const toPositiveNumber = (value) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const toSortOrder = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
};

const getGroupById = async (groupId) => {
  const [[group]] = await mysqlpool.query(
    `SELECT id, name, slug, description, sort_order, created_by, created_at, updated_at
     FROM resource_groups
     WHERE id = ?`,
    [groupId],
  );

  return group || null;
};

const getFileById = async (fileId) => {
  const [[file]] = await mysqlpool.query(
    `SELECT rf.id, rf.group_id, rg.name AS group_name, rf.title, rf.description,
            rf.original_name, rf.stored_name, rf.file_path, rf.mime_type,
            rf.extension, rf.file_size, rf.uploaded_by, uploader.name AS uploaded_by_name,
            rf.created_at, rf.updated_at
     FROM resource_files rf
     INNER JOIN resource_groups rg ON rg.id = rf.group_id
     LEFT JOIN users uploader ON uploader.id = rf.uploaded_by
     WHERE rf.id = ?`,
    [fileId],
  );

  return file || null;
};

const getUniqueGroupSlug = async (name, excludeId = null) => {
  const baseSlug = (await generateSlug(name || "resources")) || "resources";
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const params = [candidateSlug];
    let query = "SELECT id FROM resource_groups WHERE slug = ?";

    if (excludeId) {
      query += " AND id <> ?";
      params.push(excludeId);
    }

    const [[existingGroup]] = await mysqlpool.query(query, params);

    if (!existingGroup) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const getResourceLibrary = async () => {
  const [groupRows] = await mysqlpool.query(
    `SELECT rg.id, rg.name, rg.slug, rg.description, rg.sort_order, rg.created_by,
            creator.name AS created_by_name, rg.created_at, rg.updated_at
     FROM resource_groups rg
     LEFT JOIN users creator ON creator.id = rg.created_by
     ORDER BY rg.sort_order ASC, rg.name ASC, rg.id ASC`,
  );

  const [fileRows] = await mysqlpool.query(
    `SELECT rf.id, rf.group_id, rg.name AS group_name, rf.title, rf.description,
            rf.original_name, rf.stored_name, rf.file_path, rf.mime_type,
            rf.extension, rf.file_size, rf.uploaded_by, uploader.name AS uploaded_by_name,
            rf.created_at, rf.updated_at
     FROM resource_files rf
     INNER JOIN resource_groups rg ON rg.id = rf.group_id
     LEFT JOIN users uploader ON uploader.id = rf.uploaded_by
     ORDER BY rf.created_at DESC, rf.id DESC`,
  );

  const grouped = groupRows.map((group) => ({
    ...group,
    file_count: 0,
    files: [],
  }));

  const groupsById = new Map(grouped.map((group) => [group.id, group]));

  for (const file of fileRows) {
    const group = groupsById.get(file.group_id);

    if (!group) {
      continue;
    }

    group.files.push(file);
    group.file_count += 1;
  }

  return {
    groups: grouped,
    files: fileRows,
    totalGroups: grouped.length,
    totalFiles: fileRows.length,
  };
};

const sendResourceFile = async (res, resourceFile, download = false) => {
  const absolutePath = path.resolve(__dirname, "..", resourceFile.file_path);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found on disk",
    });
  }

  const safeFileName = (resourceFile.original_name || resourceFile.stored_name || "resource")
    .replace(/"/g, "")
    .trim();

  const fileStats = fs.statSync(absolutePath);

  res.setHeader("Content-Type", resourceFile.mime_type || "application/octet-stream");
  res.setHeader("Content-Length", fileStats.size);
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${safeFileName}"`,
  );

  return res.sendFile(absolutePath);
};

resourceRouter.get(
  "/library",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view the resource library",
        });
      }

      const library = await getResourceLibrary();

      return res.status(200).json({
        success: true,
        ...library,
      });
    } catch (error) {
      console.error("Error fetching resource library:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.get("/public/library", verifyApiKey, async (_req, res) => {
  try {
    const library = await getResourceLibrary();

    return res.status(200).json({
      success: true,
      ...library,
    });
  } catch (error) {
    console.error("Error fetching public resource library:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

resourceRouter.post(
  "/groups",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create resource groups",
        });
      }

      const name = String(req.body?.name || "").trim();
      const description = String(req.body?.description || "").trim();
      const sortOrder = toSortOrder(req.body?.sortOrder);

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Group name is required",
        });
      }

      const slug = await getUniqueGroupSlug(name);

      const [result] = await mysqlpool.query(
        `INSERT INTO resource_groups (name, slug, description, sort_order, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [name, slug, description || null, sortOrder, req.user.id],
      );

      return res.status(201).json({
        success: true,
        message: "Resource group created successfully",
        groupId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating resource group:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.put(
  "/groups/:groupId",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update resource groups",
        });
      }

      const groupId = toPositiveNumber(req.params.groupId);

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Invalid group id",
        });
      }

      const group = await getGroupById(groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Resource group not found",
        });
      }

      const name = String(req.body?.name || group.name).trim();
      const description =
        req.body?.description === undefined
          ? group.description
          : String(req.body.description || "").trim();
      const sortOrder =
        req.body?.sortOrder === undefined
          ? group.sort_order
          : toSortOrder(req.body.sortOrder);

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Group name is required",
        });
      }

      const slug = await getUniqueGroupSlug(name, groupId);

      await mysqlpool.query(
        `UPDATE resource_groups
         SET name = ?, slug = ?, description = ?, sort_order = ?
         WHERE id = ?`,
        [name, slug, description || null, sortOrder, groupId],
      );

      return res.status(200).json({
        success: true,
        message: "Resource group updated successfully",
      });
    } catch (error) {
      console.error("Error updating resource group:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.delete(
  "/groups/:groupId",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete resource groups",
        });
      }

      const groupId = toPositiveNumber(req.params.groupId);

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Invalid group id",
        });
      }

      const group = await getGroupById(groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Resource group not found",
        });
      }

      const [[fileCount]] = await mysqlpool.query(
        `SELECT COUNT(*) AS total FROM resource_files WHERE group_id = ?`,
        [groupId],
      );

      if (Number(fileCount?.total || 0) > 0) {
        return res.status(400).json({
          success: false,
          message: "Delete the files in this group before removing the group",
        });
      }

      await mysqlpool.query(`DELETE FROM resource_groups WHERE id = ?`, [groupId]);

      return res.status(200).json({
        success: true,
        message: "Resource group deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting resource group:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.post(
  "/files",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to upload resource files",
        });
      }

      const groupId = toPositiveNumber(req.body?.groupId);
      const file = String(req.body?.file || "");
      const originalName = String(req.body?.originalName || "").trim();
      const title = String(req.body?.title || "").trim();
      const description = String(req.body?.description || "").trim();

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "A valid group is required",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File data is required",
        });
      }

      const group = await getGroupById(groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Resource group not found",
        });
      }

      const savedFile = saveResourceFile(file, originalName);
      const fallbackTitle = path.parse(savedFile.originalName).name;

      const [result] = await mysqlpool.query(
        `INSERT INTO resource_files
         (group_id, title, description, original_name, stored_name, file_path,
          mime_type, extension, file_size, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          groupId,
          title || fallbackTitle,
          description || null,
          savedFile.originalName,
          savedFile.storedName,
          savedFile.filePath,
          savedFile.mimeType,
          savedFile.extension,
          savedFile.fileSize,
          req.user.id,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Resource file uploaded successfully",
        fileId: result.insertId,
      });
    } catch (error) {
      console.error("Error uploading resource file:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.delete(
  "/files/:fileId",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete resource files",
        });
      }

      const fileId = toPositiveNumber(req.params.fileId);

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: "Invalid file id",
        });
      }

      const resourceFile = await getFileById(fileId);

      if (!resourceFile) {
        return res.status(404).json({
          success: false,
          message: "Resource file not found",
        });
      }

      await mysqlpool.query(`DELETE FROM resource_files WHERE id = ?`, [fileId]);

      const absolutePath = path.resolve(__dirname, "..", resourceFile.file_path);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      return res.status(200).json({
        success: true,
        message: "Resource file deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting resource file:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.get(
  "/files/:fileId",
  verifyApiKey,
  authMiddleware,
  async (req, res) => {
    try {
      if (!canManageResources(req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to access this resource file",
        });
      }

      const fileId = toPositiveNumber(req.params.fileId);

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: "Invalid file id",
        });
      }

      const resourceFile = await getFileById(fileId);

      if (!resourceFile) {
        return res.status(404).json({
          success: false,
          message: "Resource file not found",
        });
      }

      return sendResourceFile(res, resourceFile, req.query.download === "1");
    } catch (error) {
      console.error("Error streaming admin resource file:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

resourceRouter.get("/public/files/:fileId", verifyApiKey, async (req, res) => {
  try {
    const fileId = toPositiveNumber(req.params.fileId);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid file id",
      });
    }

    const resourceFile = await getFileById(fileId);

    if (!resourceFile) {
      return res.status(404).json({
        success: false,
        message: "Resource file not found",
      });
    }

    return sendResourceFile(res, resourceFile, req.query.download === "1");
  } catch (error) {
    console.error("Error streaming public resource file:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = resourceRouter;
