"use client";

import AuthorActions from "@/actions/AuthorActions";
import ResourceActions from "@/actions/ResourceActions";
import { ResourceFile, ResourceGroup, ResourceLibraryResponse } from "@/types";
import { formatFileSize } from "@/utils/formatFileSize";
import { fileToBase64, optimizeUploadFile } from "@/utils/imageUpload";
import {
  RESOURCE_ACCEPT_ATTRIBUTE,
  RESOURCE_MAX_FILE_SIZE_BYTES,
} from "@/utils/resourceFiles";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  MoreVertical,
  ExternalLink,
  FileBadge2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  LoaderCircle,
  Pencil,
  Plus,
  Presentation,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const inputClassName =
  "w-full rounded-2xl border border-[#d7dde7] bg-white px-4 py-3 text-sm text-[#202124] placeholder:text-[#6b7280] transition focus:border-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/10";

const textareaClassName = `${inputClassName} min-h-[120px] resize-y`;

const labelClassName =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-[#6b7280]";

const sectionTitleClassName =
  "text-[11px] font-medium uppercase tracking-[0.26em] text-[#6b7280]";

const panelClassName =
  "rounded-[26px] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_30px_rgba(15,23,42,0.04)]";

const toolbarInputClassName =
  "w-full rounded-full border border-[#d7dde7] bg-white px-4 py-3 text-sm text-[#202124] placeholder:text-[#6b7280] transition focus:border-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/10";

const imageExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const EMPTY_GROUPS: ResourceGroup[] = [];

const getResourceIcon = (extension: string, mimeType = "") => {
  const normalizedExtension = extension.toLowerCase();
  const normalizedMimeType = mimeType.toLowerCase();

  if (
    normalizedMimeType.startsWith("image/") ||
    imageExtensions.has(normalizedExtension)
  ) {
    return FileImage;
  }

  if (["xls", "xlsx", "csv"].includes(normalizedExtension)) {
    return FileSpreadsheet;
  }

  if (["ppt", "pptx"].includes(normalizedExtension)) {
    return Presentation;
  }

  if (["doc", "docx", "txt"].includes(normalizedExtension)) {
    return FileText;
  }

  return FileBadge2;
};

const isImageFile = (file: ResourceFile) =>
  file.mime_type?.toLowerCase().startsWith("image/") ||
  imageExtensions.has(file.extension.toLowerCase());

const isPdfFile = (file: ResourceFile) =>
  file.mime_type?.toLowerCase() === "application/pdf" ||
  file.extension.toLowerCase() === "pdf";

const getFolderFiles = (group: ResourceGroup, query: string) => {
  if (!query) {
    return group.files;
  }

  return group.files.filter((file) =>
    [
      file.title,
      file.original_name,
      file.description || "",
      file.uploaded_by_name || "",
      group.name,
      group.description || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
};

const getFileViewUrl = (fileId: number) => `/api/resources/file/${fileId}`;
const getFileDownloadUrl = (fileId: number) =>
  `/api/resources/file/${fileId}?download=1`;
const getInlinePreviewUrl = (fileId: number) =>
  `${getFileViewUrl(fileId)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

const tilePdfPreviewClassName =
  "pointer-events-none absolute left-0 top-0 h-[170%] w-[170%] origin-top-left scale-[0.59] border-0 bg-white";

const getNextUntitledFolderName = (groups: ResourceGroup[]) => {
  const existingNames = new Set(groups.map((group) => group.name.toLowerCase()));

  if (!existingNames.has("untitled folder")) {
    return "Untitled Folder";
  }

  let index = 2;

  while (existingNames.has(`untitled folder ${index}`)) {
    index += 1;
  }

  return `Untitled Folder ${index}`;
};

type ManageView = "folder" | "upload";
type GridContextMenuState = {
  x: number;
  y: number;
};

const ResourceManager = () => {
  const [library, setLibrary] = useState<ResourceLibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [folderActionMenuId, setFolderActionMenuId] = useState<number | null>(null);
  const [fileActionMenuId, setFileActionMenuId] = useState<number | null>(null);
  const [gridContextMenu, setGridContextMenu] = useState<GridContextMenuState | null>(
    null,
  );
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeManageView, setActiveManageView] = useState<ManageView>("upload");
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [inlineEditingFolderId, setInlineEditingFolderId] = useState<number | null>(
    null,
  );
  const [inlineEditingFolderName, setInlineEditingFolderName] = useState("");
  const [inlineEditingOriginalName, setInlineEditingOriginalName] = useState("");
  const [isInlineSaving, setIsInlineSaving] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupSortOrder, setGroupSortOrder] = useState("0");
  const [uploadGroupId, setUploadGroupId] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDropUploading, setIsDropUploading] = useState(false);
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const dragDepthRef = useRef(0);
  const inlineFolderInputRef = useRef<HTMLInputElement | null>(null);

  const canManageResources =
    currentUserRole === "super_admin" || currentUserRole === "admin";

  const resetGroupForm = () => {
    setEditingGroupId(null);
    setGroupName("");
    setGroupDescription("");
    setGroupSortOrder("0");
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadDescription("");
    setSelectedFile(null);
    setFileInputKey((current) => current + 1);
    setUploadGroupId(openFolderId ? String(openFolderId) : "");
  };

  const uploadFilesToGroup = async (files: File[], groupId: number) => {
    if (!files.length) {
      return;
    }

    const failedFiles: string[] = [];
    let uploadedCount = 0;

    for (const sourceFile of files) {
      try {
        if (sourceFile.size > RESOURCE_MAX_FILE_SIZE_BYTES) {
          throw new Error("File size exceeds the 25 MB limit");
        }

        const optimizedFile = await optimizeUploadFile(sourceFile);
        const base64 = await fileToBase64(optimizedFile);

        await ResourceActions.uploadFile({
          groupId,
          title: "",
          description: "",
          originalName: sourceFile.name,
          file: base64,
        });

        uploadedCount += 1;
      } catch (error) {
        failedFiles.push(
          `${sourceFile.name}: ${
            error instanceof Error ? error.message : "Upload failed"
          }`,
        );
      }
    }

    if (uploadedCount > 0) {
      await loadLibrary();
    }

    if (failedFiles.length > 0) {
      toast.error(failedFiles[0]);
    }
  };

  const isFileDragEvent = (event: React.DragEvent<HTMLElement>) =>
    Array.from(event.dataTransfer.types || []).includes("Files");

  const openManageModal = (view: ManageView) => {
    resetGroupForm();
    setActiveManageView(view);
    setIsManageModalOpen(true);

    if (view === "upload") {
      resetUploadForm();
    }
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
    resetGroupForm();
    resetUploadForm();
  };

  const loadLibrary = async () => {
    try {
      const result = await ResourceActions.getLibrary();
      setLibrary(result);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load the resource library",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = AuthorActions.getCurrentUserRole();
    const role = currentUser?.role || null;
    setCurrentUserRole(role);

    if (role) {
      void loadLibrary();
      return;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (folderActionMenuId === null && fileActionMenuId === null) {
      return;
    }

    const closeMenu = () => {
      setFolderActionMenuId(null);
      setFileActionMenuId(null);
      setGridContextMenu(null);
    };

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [fileActionMenuId, folderActionMenuId, gridContextMenu]);

  useEffect(() => {
    if (!isManageModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsManageModalOpen(false);
        resetGroupForm();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isManageModalOpen]);

  const groups = library?.groups ?? EMPTY_GROUPS;
  const totalFiles = groups.reduce((sum, group) => sum + group.files.length, 0);

  const visibleFolders = groups.filter((group) => {
    if (!deferredSearch) {
      return true;
    }

    const folderMatches = [
      group.name,
      group.description || "",
      group.slug,
      ...group.files.flatMap((file) => [
        file.title,
        file.original_name,
        file.description || "",
        file.uploaded_by_name || "",
      ]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(deferredSearch);

    return folderMatches;
  });

  const openFolder =
    openFolderId !== null ? groups.find((group) => group.id === openFolderId) || null : null;

  const visibleFiles = openFolder
    ? getFolderFiles(openFolder, deferredSearch)
    : [];

  useEffect(() => {
    if (!groups.length) {
      setOpenFolderId(null);
      return;
    }

    if (
      openFolderId !== null &&
      !groups.some((group) => group.id === openFolderId)
    ) {
      setOpenFolderId(null);
    }
  }, [groups, openFolderId]);

  useEffect(() => {
    dragDepthRef.current = 0;
    setIsDragActive(false);
  }, [openFolderId]);

  useEffect(() => {
    if (!inlineEditingFolderId) {
      return;
    }

    const input = inlineFolderInputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [inlineEditingFolderId]);

  const handleOpenFolder = (group: ResourceGroup) => {
    setOpenFolderId(group.id);
    setFolderActionMenuId(null);
    setFileActionMenuId(null);
    setGridContextMenu(null);
    setUploadGroupId(String(group.id));
  };

  const handleBackToFolders = () => {
    setOpenFolderId(null);
    setFileActionMenuId(null);
  };

  const finishInlineFolderNaming = async (mode: "save" | "cancel") => {
    if (!inlineEditingFolderId) {
      return;
    }

    const folder = groups.find((group) => group.id === inlineEditingFolderId);

    if (!folder) {
      setInlineEditingFolderId(null);
      setInlineEditingFolderName("");
      setInlineEditingOriginalName("");
      return;
    }

    if (mode === "cancel") {
      setInlineEditingFolderId(null);
      setInlineEditingFolderName("");
      setInlineEditingOriginalName("");
      return;
    }

    const nextName = inlineEditingFolderName.trim() || inlineEditingOriginalName;

    if (!nextName || nextName === folder.name) {
      setInlineEditingFolderId(null);
      setInlineEditingFolderName("");
      setInlineEditingOriginalName("");
      return;
    }

    setIsInlineSaving(true);

    try {
      await ResourceActions.updateGroup(folder.id, {
        name: nextName,
        description: folder.description || "",
        sortOrder: folder.sort_order,
      });

      setInlineEditingFolderId(null);
      setInlineEditingFolderName("");
      setInlineEditingOriginalName("");
      await loadLibrary();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename folder",
      );
    } finally {
      setIsInlineSaving(false);
    }
  };

  const handleGridContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canManageResources || openFolder) {
      return;
    }

    event.preventDefault();
    setFolderActionMenuId(null);
    setFileActionMenuId(null);

    const menuWidth = 180;
    const menuHeight = 64;

    setGridContextMenu({
      x: Math.min(event.clientX, window.innerWidth - menuWidth),
      y: Math.min(event.clientY, window.innerHeight - menuHeight),
    });
  };

  const handleCreateFolderFromContextMenu = async () => {
    if (!canManageResources) {
      return;
    }

    const defaultName = getNextUntitledFolderName(groups);
    const nextSortOrder =
      groups.length > 0
        ? Math.max(...groups.map((group) => Number(group.sort_order) || 0)) + 1
        : 0;

    setGridContextMenu(null);
    setSearch("");

    try {
      const result = await ResourceActions.createGroup({
        name: defaultName,
        description: "",
        sortOrder: nextSortOrder,
      });

      await loadLibrary();
      setInlineEditingFolderId(result.groupId);
      setInlineEditingFolderName(defaultName);
      setInlineEditingOriginalName(defaultName);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create folder",
      );
    }
  };

  const handleGroupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsSavingGroup(true);

    try {
      const payload = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        sortOrder: Number(groupSortOrder) || 0,
      };

      if (editingGroupId) {
        await ResourceActions.updateGroup(editingGroupId, payload);
      } else {
        await ResourceActions.createGroup(payload);
      }

      resetGroupForm();
      setIsManageModalOpen(false);
      await loadLibrary();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save resource folder",
      );
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleEditGroup = (group: ResourceGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupDescription(group.description || "");
    setGroupSortOrder(String(group.sort_order));
    setActiveManageView("folder");
    setIsManageModalOpen(true);
  };

  const handleDeleteGroup = async (group: ResourceGroup) => {
    const shouldDelete = window.confirm(
      `Delete the "${group.name}" folder? This will only work if the folder has no files.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await ResourceActions.deleteGroup(group.id);

      if (openFolderId === group.id) {
        setOpenFolderId(null);
      }

      if (uploadGroupId === String(group.id)) {
        setUploadGroupId("");
      }

      await loadLibrary();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete resource folder",
      );
    }
  };

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadGroupId) {
      toast.error("Please select a folder for this file");
      return;
    }

    if (!selectedFile) {
      toast.error("Please choose a file to upload");
      return;
    }

    if (selectedFile.size > RESOURCE_MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds the 25 MB limit");
      return;
    }

    setIsUploadingFile(true);

    try {
      const optimizedFile = await optimizeUploadFile(selectedFile);
      const base64 = await fileToBase64(optimizedFile);

      await ResourceActions.uploadFile({
        groupId: Number(uploadGroupId),
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        originalName: selectedFile.name,
        file: base64,
      });

      resetGroupForm();
      resetUploadForm();
      setIsManageModalOpen(false);
      await loadLibrary();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload resource file",
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFolderDragEnter = (event: React.DragEvent<HTMLElement>) => {
    if (!canManageResources || !openFolder || !isFileDragEvent(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleFolderDragOver = (event: React.DragEvent<HTMLElement>) => {
    if (!canManageResources || !openFolder || !isFileDragEvent(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";

    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleFolderDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (!canManageResources || !openFolder || !isFileDragEvent(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleFolderDrop = async (event: React.DragEvent<HTMLElement>) => {
    if (!canManageResources || !openFolder || !isFileDragEvent(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragActive(false);

    const droppedFiles = Array.from(event.dataTransfer.files || []);

    if (!droppedFiles.length) {
      return;
    }

    setIsDropUploading(true);

    try {
      await uploadFilesToGroup(droppedFiles, openFolder.id);
    } finally {
      setIsDropUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number, fileTitle: string) => {
    const shouldDelete = window.confirm(
      `Delete "${fileTitle}" from the resource library?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await ResourceActions.deleteFile(fileId);
      await loadLibrary();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete resource file",
      );
    }
  };

  return (
    <div className="-mx-5 -mb-6 min-h-[calc(100vh-210px)] bg-[#f7f9fc] px-5 pb-10 pt-3 text-[#202124] sm:-mx-7 sm:px-7 lg:-mx-10 lg:-mb-8 lg:px-10">
      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className={sectionTitleClassName}>Library Overview</p>

              {openFolder ? (
                <div className="mt-3 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={handleBackToFolders}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#202124] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-[#eef4ff]"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
                        <FolderOpen size={24} />
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6b7280]">
                          Open Folder
                        </p>
                        <h2 className="text-2xl font-semibold text-[#202124]">
                          {openFolder.name}
                        </h2>
                      </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f6368]">
                      {visibleFiles.length} of {openFolder.files.length} files
                      {deferredSearch ? ` match your search inside this folder.` : "."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-semibold text-[#202124]">
                    Folders
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f6368]">
                    Browse resource folders in a grid view. Click a folder to open
                    its file list and preview supported files like PDFs and images.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#5f6368]">
              {canManageResources && (
                <button
                  type="button"
                  onClick={() =>
                    openManageModal(groups.length > 0 ? "upload" : "folder")
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1558b0]"
                >
                  <Plus size={16} />
                  Add Resource
                </button>
              )}
              <span className="rounded-full bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                {groups.length} folders
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                {totalFiles} files
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#6b7280]">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  openFolder
                    ? `Search inside ${openFolder.name}`
                    : "Search folders, file names, descriptions, or uploader"
                }
                className={`${toolbarInputClassName} pl-11`}
              />
            </label>

            <div className="rounded-[22px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
                {openFolder ? "Current Location" : "Browse Tip"}
              </p>
              {openFolder ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#5f6368]">
                  <span>All folders</span>
                  <ChevronRight size={16} />
                  <span className="font-semibold text-[#202124]">
                    {openFolder.name}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                  Open any folder card to see its files in a list view with a live
                  preview panel.
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,180px))] justify-start gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-[22px] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                  <div className="mt-5 h-5 w-24 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : openFolder ? (
            <div>
              <div
                onDragEnter={handleFolderDragEnter}
                onDragOver={handleFolderDragOver}
                onDragLeave={handleFolderDragLeave}
                onDrop={handleFolderDrop}
                className={`relative overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition ${
                  canManageResources && (isDragActive || isDropUploading)
                    ? "ring-2 ring-[#1a73e8] ring-offset-2 ring-offset-[#f7f9fc]"
                    : ""
                }`}
              >
                {canManageResources && (isDragActive || isDropUploading) && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#1a73e8]/10 backdrop-blur-[1px]">
                    <div className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#174ea6] shadow-[0_10px_30px_rgba(26,115,232,0.14)]">
                      {isDropUploading
                        ? "Uploading file to this folder..."
                        : `Drop file${openFolder ? "s" : ""} into ${openFolder.name}`}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 border-b border-[#edf1f7] px-5 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#202124]">
                      {openFolder.name} Files
                    </h3>
                    {openFolder.description && (
                      <p className="mt-1 text-sm text-[#5f6368]">
                        {openFolder.description}
                      </p>
                    )}
                  </div>

                  {canManageResources && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditGroup(openFolder)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d7dde7] bg-white px-4 py-2.5 text-sm font-medium text-[#202124] transition hover:bg-[#f7f9fc]"
                      >
                        <Pencil size={16} />
                        Edit Folder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(openFolder)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#f1c7c7] bg-white px-4 py-2.5 text-sm font-medium text-[#c5221f] transition hover:bg-[#fef2f2]"
                      >
                        <Trash2 size={16} />
                        Delete Folder
                      </button>
                    </div>
                  )}
                </div>

                {visibleFiles.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,220px))] gap-4 px-5 py-5">
                    {visibleFiles.map((file) => {
                      const FileIcon = getResourceIcon(file.extension, file.mime_type);

                      return (
                        <article
                          key={file.id}
                          className="relative"
                        >
                          <div className="absolute right-3 top-3 z-10">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setFileActionMenuId((current) =>
                                  current === file.id ? null : file.id,
                                );
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#5f6368] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-white"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {fileActionMenuId === file.id && (
                              <div
                                onClick={(event) => event.stopPropagation()}
                                className="absolute right-0 top-10 min-w-[150px] overflow-hidden rounded-2xl border border-[#e7ebf2] bg-white py-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFileActionMenuId(null);
                                    window.open(
                                      getFileViewUrl(file.id),
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#202124] transition hover:bg-[#f7f9fc]"
                                >
                                  <ExternalLink size={15} />
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFileActionMenuId(null);
                                    window.location.assign(getFileDownloadUrl(file.id));
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#174ea6] transition hover:bg-[#eef4ff]"
                                >
                                  <Download size={15} />
                                  Download
                                </button>
                                {canManageResources && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFileActionMenuId(null);
                                      void handleDeleteFile(file.id, file.title);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#c5221f] transition hover:bg-[#fef2f2]"
                                  >
                                    <Trash2 size={15} />
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                          role="button"
                            onClick={() =>
                              window.open(
                                getFileViewUrl(file.id),
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="flex aspect-square w-full flex-col rounded-[24px] border border-[#edf1f7] bg-white p-3 text-left transition hover:bg-[#f8faff] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                        >
                          <div className="relative flex-1 overflow-hidden rounded-[20px] bg-[#f7f9fc]">
                            {isImageFile(file) ? (
                              <Image
                                src={getFileViewUrl(file.id)}
                                alt={file.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : isPdfFile(file) ? (
                              <div className="relative h-full w-full overflow-hidden bg-white">
                                <iframe
                                  title={file.title}
                                  src={getInlinePreviewUrl(file.id)}
                                  scrolling="no"
                                  className={tilePdfPreviewClassName}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-white" />
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e6ebf3] bg-white text-[#5f6368]">
                                  <FileIcon size={24} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 min-w-0">
                            <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-[#202124]">
                              {file.title}
                            </h4>
                          </div>
                          </button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-10 text-center">
                    <h3 className="text-lg font-semibold text-[#202124]">
                      {openFolder.files.length === 0
                        ? "This folder is empty"
                        : "No files match your search"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                      {openFolder.files.length === 0
                        ? "Upload files into this folder to make them available."
                        : "Try a different search term or clear the current filter."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : visibleFolders.length > 0 ? (
            <div
              onContextMenu={handleGridContextMenu}
              className="grid grid-cols-[repeat(auto-fill,minmax(150px,180px))] justify-start gap-4"
            >
              {visibleFolders.map((group) => (
                <article
                  key={group.id}
                  className="relative"
                >
                  {canManageResources && (
                    <div className="absolute right-3 top-3 z-10">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFolderActionMenuId((current) =>
                            current === group.id ? null : group.id,
                          );
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#5f6368] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-[#f7f9fc]"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {folderActionMenuId === group.id && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-0 top-11 min-w-[150px] overflow-hidden rounded-2xl border border-[#e7ebf2] bg-white py-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setFolderActionMenuId(null);
                              handleEditGroup(group);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#202124] transition hover:bg-[#f7f9fc]"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFolderActionMenuId(null);
                              void handleDeleteGroup(group);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#c5221f] transition hover:bg-[#fef2f2]"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {inlineEditingFolderId === group.id ? (
                    <div className="flex aspect-square w-full flex-col rounded-[22px] bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-1 items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
                          <Folder size={24} />
                        </span>
                      </div>

                      <input
                        ref={inlineFolderInputRef}
                        type="text"
                        value={inlineEditingFolderName}
                        disabled={isInlineSaving}
                        onChange={(event) =>
                          setInlineEditingFolderName(event.target.value)
                        }
                        onBlur={() => {
                          void finishInlineFolderNaming("save");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void finishInlineFolderNaming("save");
                          }

                          if (event.key === "Escape") {
                            event.preventDefault();
                            void finishInlineFolderNaming("cancel");
                          }
                        }}
                        className="mt-2.5 w-full rounded-xl border border-[#d7dde7] bg-white px-2.5 py-2 text-sm font-semibold leading-5 text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenFolder(group)}
                      className="flex aspect-square w-full flex-col rounded-[22px] bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:bg-[#f8faff] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex flex-1 items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
                          <Folder size={24} />
                        </span>
                      </div>

                      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-5 text-[#202124]">
                        {group.name}
                      </h3>
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div
              onContextMenu={handleGridContextMenu}
              className="rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
            >
              <h3 className="text-xl font-semibold text-[#202124]">
                No folders found
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5f6368]">
                Create a folder or clear your search to continue.
              </p>
            </div>
          )}
        </section>
      </div>

      {canManageResources && isManageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1724]/40 p-4 backdrop-blur-sm"
          onClick={closeManageModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[30px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1f7] px-6 py-5">
              <div>
                <p className={sectionTitleClassName}>Resource Actions</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#202124]">
                  {activeManageView === "folder"
                    ? editingGroupId
                      ? "Edit Folder"
                      : "Create Folder"
                    : "Upload File"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                  {activeManageView === "folder"
                    ? "Create or update top-level folders for your internal resource library."
                    : "Upload a document or image into one of your existing folders."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeManageModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7dde7] text-[#5f6368] transition hover:bg-[#f7f9fc]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-[#edf1f7] px-6 py-4">
              <div className="inline-flex rounded-full bg-[#f3f6fb] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveManageView("folder");
                    resetUploadForm();
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeManageView === "folder"
                      ? "bg-white text-[#202124] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      : "text-[#5f6368] hover:text-[#202124]"
                  }`}
                >
                  Folder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveManageView("upload");

                    if (!uploadGroupId) {
                      setUploadGroupId(openFolderId ? String(openFolderId) : "");
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeManageView === "upload"
                      ? "bg-white text-[#202124] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      : "text-[#5f6368] hover:text-[#202124]"
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            <div className="max-h-[calc(90vh-176px)] overflow-y-auto px-6 py-6">
              {activeManageView === "folder" ? (
                <section className={`${panelClassName} space-y-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={sectionTitleClassName}>Folder Setup</p>
                      <h3 className="mt-3 text-xl font-semibold text-[#202124]">
                        {editingGroupId ? "Edit Folder" : "Create Folder"}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f6368]">
                        Create top-level folders like Company, SOP, Guide, Proposal
                        Format, or Strategy.
                      </p>
                    </div>

                    {editingGroupId && (
                      <button
                        type="button"
                        onClick={resetGroupForm}
                        className="rounded-[14px] border border-[#d7dde7] px-4 py-2 text-sm text-[#5f6368] transition hover:bg-[#f7f9fc]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGroupSubmit}>
                    <div className="space-y-2 md:col-span-1">
                      <label className={labelClassName} htmlFor="resource-group-name">
                        Folder Name
                      </label>
                      <input
                        id="resource-group-name"
                        type="text"
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                        placeholder="SOP"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className={labelClassName} htmlFor="resource-group-sort-order">
                        Sort Order
                      </label>
                      <input
                        id="resource-group-sort-order"
                        type="number"
                        value={groupSortOrder}
                        onChange={(event) => setGroupSortOrder(event.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className={labelClassName} htmlFor="resource-group-description">
                        Description
                      </label>
                      <textarea
                        id="resource-group-description"
                        value={groupDescription}
                        onChange={(event) => setGroupDescription(event.target.value)}
                        placeholder="Short context about what belongs in this folder"
                        className={textareaClassName}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingGroup}
                      className="inline-flex items-center gap-2 rounded-[18px] bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1558b0] disabled:cursor-not-allowed disabled:bg-[#9dbceb] md:col-span-2 md:w-fit"
                    >
                      {isSavingGroup ? (
                        <>
                          <LoaderCircle size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          {editingGroupId ? "Update Folder" : "Create Folder"}
                        </>
                      )}
                    </button>
                  </form>
                </section>
              ) : (
                <section className={`${panelClassName} space-y-6`}>
                  <div>
                    <p className={sectionTitleClassName}>File Upload</p>
                    <h3 className="mt-3 text-xl font-semibold text-[#202124]">
                      Upload Into a Folder
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f6368]">
                      Upload PDFs, Office documents, text files, and images into the
                      selected folder. Files stay outside the public media library.
                    </p>
                  </div>

                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleFileUpload}>
                    <div className="space-y-2 md:col-span-1">
                      <label className={labelClassName} htmlFor="resource-upload-group">
                        Folder
                      </label>
                      <select
                        id="resource-upload-group"
                        value={uploadGroupId}
                        onChange={(event) => setUploadGroupId(event.target.value)}
                        className={inputClassName}
                        disabled={groups.length === 0}
                      >
                        <option value="">Select a folder</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className={labelClassName} htmlFor="resource-upload-title">
                        Title
                      </label>
                      <input
                        id="resource-upload-title"
                        type="text"
                        value={uploadTitle}
                        onChange={(event) => setUploadTitle(event.target.value)}
                        placeholder="Leave blank to use the file name"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        className={labelClassName}
                        htmlFor="resource-upload-description"
                      >
                        Description
                      </label>
                      <textarea
                        id="resource-upload-description"
                        value={uploadDescription}
                        onChange={(event) => setUploadDescription(event.target.value)}
                        placeholder="Optional summary or usage note"
                        className={textareaClassName}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className={labelClassName} htmlFor="resource-upload-file">
                        File
                      </label>
                      <label
                        htmlFor="resource-upload-file"
                        className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#c8d0dd] bg-[#f8fafc] px-5 py-6 text-center transition hover:border-[#1a73e8] hover:bg-[#eef4ff]"
                      >
                        <UploadCloud size={24} className="text-[#1a73e8]" />
                        <p className="mt-3 text-sm font-medium text-[#202124]">
                          {selectedFile ? selectedFile.name : "Choose a file to upload"}
                        </p>
                        <p className="mt-2 text-xs leading-6 text-[#5f6368]">
                          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG,
                          WEBP, GIF up to 25 MB
                        </p>
                      </label>
                      <input
                        key={fileInputKey}
                        id="resource-upload-file"
                        type="file"
                        accept={RESOURCE_ACCEPT_ATTRIBUTE}
                        onChange={(event) =>
                          setSelectedFile(event.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      {selectedFile && (
                        <p className="text-xs text-[#5f6368]">
                          {selectedFile.name} • {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingFile || groups.length === 0}
                      className="inline-flex items-center gap-2 rounded-[18px] bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1558b0] disabled:cursor-not-allowed disabled:bg-[#9dbceb] md:col-span-2 md:w-fit"
                    >
                      {isUploadingFile ? (
                        <>
                          <LoaderCircle size={16} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          Upload File
                        </>
                      )}
                    </button>
                  </form>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {canManageResources && gridContextMenu && !openFolder && (
        <div
          className="fixed z-50 min-w-[180px] overflow-hidden rounded-2xl border border-[#e7ebf2] bg-white py-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
          style={{ left: gridContextMenu.x, top: gridContextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              void handleCreateFolderFromContextMenu();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[#202124] transition hover:bg-[#f7f9fc]"
          >
            <Plus size={15} />
            Create Folder
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
