import "server-only";

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { resourceDb } from "./resourceDb";
import {
  deleteStoredResourceFile,
  getStoredResourceFilePath,
  saveResourceFile,
} from "./resourceStorage";

type ResourceGroupRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_by: number | null;
  created_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ResourceFileRow = RowDataPacket & {
  id: number;
  group_id: number;
  group_name: string;
  title: string;
  description: string | null;
  original_name: string;
  stored_name: string;
  file_path: string;
  mime_type: string;
  extension: string;
  file_size: number;
  uploaded_by: number | null;
  uploaded_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "resources";

export const getResourceLibrary = async () => {
  const [groupRows] = await resourceDb.query<ResourceGroupRow[]>(
    `SELECT rg.id, rg.name, rg.slug, rg.description, rg.sort_order, rg.created_by,
            creator.name AS created_by_name, rg.created_at, rg.updated_at
     FROM resource_groups rg
     LEFT JOIN users creator ON creator.id = rg.created_by
     ORDER BY rg.sort_order ASC, rg.name ASC, rg.id ASC`,
  );

  const [fileRows] = await resourceDb.query<ResourceFileRow[]>(
    `SELECT rf.id, rf.group_id, rg.name AS group_name, rf.title, rf.description,
            rf.original_name, rf.stored_name, rf.file_path, rf.mime_type,
            rf.extension, rf.file_size, rf.uploaded_by, uploader.name AS uploaded_by_name,
            rf.created_at, rf.updated_at
     FROM resource_files rf
     INNER JOIN resource_groups rg ON rg.id = rf.group_id
     LEFT JOIN users uploader ON uploader.id = rf.uploaded_by
     ORDER BY rf.created_at DESC, rf.id DESC`,
  );

  const groups = groupRows.map((group) => ({
    ...group,
    file_count: 0,
    files: [] as ResourceFileRow[],
  }));

  const groupsById = new Map(groups.map((group) => [group.id, group]));

  for (const file of fileRows) {
    const group = groupsById.get(file.group_id);

    if (!group) {
      continue;
    }

    group.files.push(file);
    group.file_count += 1;
  }

  return {
    groups,
    files: fileRows,
    totalGroups: groups.length,
    totalFiles: fileRows.length,
  };
};

export const getResourceFileById = async (fileId: number) => {
  const [rows] = await resourceDb.query<ResourceFileRow[]>(
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

  return rows[0] || null;
};

const getResourceGroupById = async (groupId: number) => {
  const [rows] = await resourceDb.query<ResourceGroupRow[]>(
    `SELECT id, name, slug, description, sort_order, created_by, created_at, updated_at
     FROM resource_groups
     WHERE id = ?`,
    [groupId],
  );

  return rows[0] || null;
};

const getUniqueGroupSlug = async (name: string, excludeId?: number) => {
  const baseSlug = slugify(name);
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const params: Array<string | number> = [candidateSlug];
    let query = "SELECT id FROM resource_groups WHERE slug = ?";

    if (excludeId) {
      query += " AND id <> ?";
      params.push(excludeId);
    }

    const [rows] = await resourceDb.query<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

export const createResourceGroup = async (
  userId: number,
  payload: { name: string; description?: string; sortOrder?: number },
) => {
  const name = payload.name.trim();

  if (!name) {
    throw new Error("Group name is required");
  }

  const slug = await getUniqueGroupSlug(name);

  const [result] = await resourceDb.query<ResultSetHeader>(
    `INSERT INTO resource_groups (name, slug, description, sort_order, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [
      name,
      slug,
      payload.description?.trim() || null,
      Number(payload.sortOrder) || 0,
      userId,
    ],
  );

  return result.insertId;
};

export const updateResourceGroup = async (
  groupId: number,
  payload: { name: string; description?: string; sortOrder?: number },
) => {
  const existingGroup = await getResourceGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Resource group not found");
  }

  const name = payload.name.trim();

  if (!name) {
    throw new Error("Group name is required");
  }

  const slug = await getUniqueGroupSlug(name, groupId);

  await resourceDb.query(
    `UPDATE resource_groups
     SET name = ?, slug = ?, description = ?, sort_order = ?
     WHERE id = ?`,
    [
      name,
      slug,
      payload.description?.trim() || null,
      Number(payload.sortOrder) || 0,
      groupId,
    ],
  );
};

export const deleteResourceGroup = async (groupId: number) => {
  const existingGroup = await getResourceGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Resource group not found");
  }

  const [rows] = await resourceDb.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM resource_files WHERE group_id = ?",
    [groupId],
  );

  if (Number(rows[0]?.total || 0) > 0) {
    throw new Error("Delete the files in this group before removing the group");
  }

  await resourceDb.query("DELETE FROM resource_groups WHERE id = ?", [groupId]);
};

export const createResourceFile = async (
  userId: number,
  payload: {
    groupId: number;
    title?: string;
    description?: string;
    originalName: string;
    file: string;
  },
) => {
  const existingGroup = await getResourceGroupById(payload.groupId);

  if (!existingGroup) {
    throw new Error("Resource group not found");
  }

  const savedFile = saveResourceFile(payload.file, payload.originalName);

  try {
    const fallbackTitle = payload.originalName.replace(/\.[^.]+$/, "").trim();

    const [result] = await resourceDb.query<ResultSetHeader>(
      `INSERT INTO resource_files
       (group_id, title, description, original_name, stored_name, file_path,
        mime_type, extension, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.groupId,
        payload.title?.trim() || fallbackTitle || "Untitled file",
        payload.description?.trim() || null,
        savedFile.originalName,
        savedFile.storedName,
        savedFile.filePath,
        savedFile.mimeType,
        savedFile.extension,
        savedFile.fileSize,
        userId,
      ],
    );

    return result.insertId;
  } catch (error) {
    deleteStoredResourceFile(savedFile.filePath);
    throw error;
  }
};

export const deleteResourceFile = async (fileId: number) => {
  const existingFile = await getResourceFileById(fileId);

  if (!existingFile) {
    throw new Error("Resource file not found");
  }

  await resourceDb.query("DELETE FROM resource_files WHERE id = ?", [fileId]);
  deleteStoredResourceFile(existingFile.file_path);
};

export const getResourceFileAbsolutePath = (filePath: string) =>
  getStoredResourceFilePath(filePath);
