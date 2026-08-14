"use client";

import { ResourceGroup } from "@/types";
import { formatFileSize } from "@/utils/formatFileSize";
import { useDeferredValue, useState, useTransition } from "react";
import {
  Download,
  ExternalLink,
  FileBadge2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LoaderCircle,
  Lock,
  Presentation,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ResourceLibraryViewProps = {
  groups: ResourceGroup[];
  errorMessage?: string;
};

const getResourceIcon = (extension: string) => {
  const normalizedExtension = extension.toLowerCase();

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

const formatResourceDate = (value?: string) => {
  if (!value) {
    return "Recently added";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ResourceLibraryView = ({
  groups,
  errorMessage,
}: ResourceLibraryViewProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | "all">("all");
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredGroups = groups
    .map((group) => {
      const matchesSelectedGroup =
        selectedGroupId === "all" || group.id === selectedGroupId;

      if (!matchesSelectedGroup) {
        return null;
      }

      const filteredFiles = group.files.filter((file) => {
        if (!deferredSearch) {
          return true;
        }

        return [
          group.name,
          file.title,
          file.original_name,
          file.description || "",
          file.uploaded_by_name || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(deferredSearch);
      });

      if (!deferredSearch) {
        return group;
      }

      const groupMatchesSearch = [
        group.name,
        group.description || "",
        group.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(deferredSearch);

      if (!groupMatchesSearch && filteredFiles.length === 0) {
        return null;
      }

      return {
        ...group,
        files: groupMatchesSearch && filteredFiles.length === 0 ? group.files : filteredFiles,
      };
    })
    .filter((group): group is ResourceGroup => Boolean(group));

  const totalVisibleFiles = filteredGroups.reduce(
    (sum, group) => sum + group.files.length,
    0,
  );

  const handleLock = async () => {
    await fetch("/api/resources/session", { method: "DELETE" });
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--bg-inset)]/90 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bfcee3] bg-[var(--bg-selected)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[#2a476f]">
              <FolderOpen size={14} />
              Team Resource Library
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0b378e] sm:text-4xl">
              Browse internal documents in one place
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#2a486f]">
              Open guides, SOPs, proposal formats, strategies, and other shared team
              references without entering the main dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLock}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ddc5d3] bg-[var(--status-purple-bg)] px-4 py-3 text-sm font-medium text-[#8e0b2b] transition hover:bg-[var(--status-purple-bg)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Locking...
              </>
            ) : (
              <>
                <Lock size={16} />
                Lock Library
              </>
            )}
          </button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-[#2a476f]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by group, title, file name, or uploader"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-selected)] py-3 pl-11 pr-4 text-sm text-[var(--text-strong)] placeholder:text-[#2a476f] transition focus:border-[#c4cfde] focus:outline-none focus:ring-4 focus:ring-[#c4cfde]/20"
            />
          </label>

          <select
            value={selectedGroupId}
            onChange={(event) =>
              setSelectedGroupId(
                event.target.value === "all" ? "all" : Number(event.target.value),
              )
            }
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-selected)] px-4 py-3 text-sm text-[var(--text-strong)] transition focus:border-[#c4cfde] focus:outline-none focus:ring-4 focus:ring-[#c4cfde]/20"
          >
            <option value="all">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#2a486f]">
          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-selected)] px-3 py-1.5">
            {groups.length} groups
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-selected)] px-3 py-1.5">
            {totalVisibleFiles} visible files
          </span>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-6 rounded-[26px] border border-[#e1c2c7]/40 bg-[var(--status-purple-bg)] p-6 text-sm text-[#831626]">
          {errorMessage}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="mt-8 space-y-6">
          {filteredGroups.map((group) => (
            <section
              key={group.id}
              className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-selected)]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7"
            >
              <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[#0b378e]">
                    {group.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#2a486f]">
                    {group.description || "Shared reference documents for this section."}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#bde1e5]/30 bg-[#e9f4f6] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#236d76]">
                  {group.files.length} files
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {group.files.map((file) => {
                  const FileIcon = getResourceIcon(file.extension);

                  return (
                    <article
                      key={file.id}
                      className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-selected)] p-5 transition hover:border-[#c3cfdf] hover:bg-[var(--bg-selected)]"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-selected)] text-[#114688]">
                          <FileIcon size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-[var(--text-strong)]">
                              {file.title}
                            </h3>
                            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-selected)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              {file.extension}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                            {file.description || file.original_name}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#2a496f]">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>{formatResourceDate(file.created_at)}</span>
                            <span>{file.uploaded_by_name || "Team upload"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={`/api/resources/file/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-selected)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--bg-selected)]"
                        >
                          <ExternalLink size={16} />
                          Open
                        </a>
                        <a
                          href={`/api/resources/file/${file.id}?download=1`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--status-green-text)]/35 bg-[#e9f4f6] px-4 py-2.5 text-sm font-medium text-[var(--status-green-text)] transition hover:bg-[#e9f4f6]"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--bg-selected)]/82 p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#0b378e]">No files found</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Try a different search term or switch back to all groups.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryView;
