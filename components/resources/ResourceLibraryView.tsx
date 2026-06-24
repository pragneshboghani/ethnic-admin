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
      <div className="rounded-[30px] border border-white/10 bg-[#101826]/90 p-6 shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#203149] bg-[#121d2d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[#90a4c0]">
              <FolderOpen size={14} />
              Team Resource Library
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#f3f7ff] sm:text-4xl">
              Browse internal documents in one place
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#95a6bc]">
              Open guides, SOPs, proposal formats, strategies, and other shared team
              references without entering the main dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLock}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#3a2230] bg-[#261723] px-4 py-3 text-sm font-medium text-[#ffd2dd] transition hover:bg-[#301b29] disabled:cursor-not-allowed disabled:opacity-70"
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
            <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-[#7f91aa]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by group, title, file name, or uploader"
              className="w-full rounded-2xl border border-white/10 bg-[#0d1522] py-3 pl-11 pr-4 text-sm text-[#eef4ff] placeholder:text-[#67788f] transition focus:border-[#57749b] focus:outline-none focus:ring-4 focus:ring-[#57749b]/20"
            />
          </label>

          <select
            value={selectedGroupId}
            onChange={(event) =>
              setSelectedGroupId(
                event.target.value === "all" ? "all" : Number(event.target.value),
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-[#0d1522] px-4 py-3 text-sm text-[#eef4ff] transition focus:border-[#57749b] focus:outline-none focus:ring-4 focus:ring-[#57749b]/20"
          >
            <option value="all">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#8da0b9]">
          <span className="rounded-full border border-white/10 bg-[#101726] px-3 py-1.5">
            {groups.length} groups
          </span>
          <span className="rounded-full border border-white/10 bg-[#101726] px-3 py-1.5">
            {totalVisibleFiles} visible files
          </span>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-6 rounded-[26px] border border-[#67333c]/40 bg-[#22131a] p-6 text-sm text-[#f3b7c0]">
          {errorMessage}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="mt-8 space-y-6">
          {filteredGroups.map((group) => (
            <section
              key={group.id}
              className="rounded-[28px] border border-white/10 bg-[#111927]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7"
            >
              <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[#edf3ff]">
                    {group.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#91a2b8]">
                    {group.description || "Shared reference documents for this section."}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#2d6b73]/30 bg-[#17333a] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#bce6eb]">
                  {group.files.length} files
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {group.files.map((file) => {
                  const FileIcon = getResourceIcon(file.extension);

                  return (
                    <article
                      key={file.id}
                      className="rounded-[24px] border border-white/8 bg-[#0e1623] p-5 transition hover:border-[#32455f] hover:bg-[#111b2b]"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#162133] text-[#c1d9f7]">
                          <FileIcon size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-[#eef4ff]">
                              {file.title}
                            </h3>
                            <span className="rounded-full border border-white/8 bg-[#151f30] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8ea0b8]">
                              {file.extension}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8ea0b8]">
                            {file.description || file.original_name}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#7488a1]">
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
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#162133] px-4 py-2.5 text-sm font-medium text-[#eef4ff] transition hover:bg-[#1b2940]"
                        >
                          <ExternalLink size={16} />
                          Open
                        </a>
                        <a
                          href={`/api/resources/file/${file.id}?download=1`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#2f6670]/35 bg-[#17343b] px-4 py-2.5 text-sm font-medium text-[#c2edf0] transition hover:bg-[#1d4048]"
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
        <div className="mt-8 rounded-[28px] border border-dashed border-white/12 bg-[#111927]/82 p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#edf3ff]">No files found</h2>
          <p className="mt-3 text-sm leading-7 text-[#8ea0b8]">
            Try a different search term or switch back to all groups.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryView;
