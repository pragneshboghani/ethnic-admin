'use client';

import { PublishHistoryItem } from "@/types";
import { formatDateTime } from "@/utils/formatDateTime";

type PublishStatusTrackingProps = {
    globalStatus?: "draft" | "publish" | "future";
    updateDate?: string;
    currentBlogStatus: Array<{
        platformId: number;
        platformName: string;
        publishStatus: string;
        slug: string;
    }>;
    publishHistory?: PublishHistoryItem[];
    publishHistoryLoading?: boolean;
};

const statusLabelMap: Record<string, string> = {
    draft: "Draft",
    future: "Scheduled",
    publish: "Published",
};

const formatFieldLabel = (value: string) =>
    value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const parseChangedFields = (
    value: PublishHistoryItem["changed_fields"],
    fallback: string,
) => {
    if (Array.isArray(value)) {
        return value.map((field) => formatFieldLabel(String(field)));
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((field) => formatFieldLabel(String(field)));
            }
        } catch {
            return [formatFieldLabel(value)];
        }
    }

    return fallback ? [formatFieldLabel(fallback)] : [];
};

const PublishStatusTracking = ({
    globalStatus = "draft",
    updateDate,
    currentBlogStatus,
    publishHistory = [],
    publishHistoryLoading = false,
}: PublishStatusTrackingProps) => {
    const latestHistory = publishHistory[0];

    return (
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8 max-w-[1000px] w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-[#eef4ff]">Publishing Status Tracking</h3>
                    <p className="mt-1 text-sm text-[#8ea0b8]">
                        Current publish state and recent activity for this blog.
                    </p>
                </div>
                {(latestHistory?.created_at || updateDate) && (
                    <span className="rounded-full border border-white/8 bg-[#151d2c] px-3 py-1.5 text-xs text-[#8ea0b8]">
                        Last activity {formatDateTime(latestHistory?.created_at || updateDate || "")}
                    </span>
                )}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/8 bg-[#151d2c] p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                        Blog Status
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#eef4ff]">
                        {statusLabelMap[globalStatus] || "Draft"}
                    </p>
                    <p className="mt-2 text-sm text-[#8ea0b8]">
                        {currentBlogStatus.length} platform{currentBlogStatus.length === 1 ? "" : "s"} connected
                    </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-[#151d2c] p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                        Recent Change
                    </p>
                    <p className="mt-3 text-base font-semibold text-[#eef4ff]">
                        {latestHistory
                            ? `${formatFieldLabel(latestHistory.action_type)} ${formatFieldLabel(latestHistory.entity_type)}`
                            : "No tracked activity yet"}
                    </p>
                    <p className="mt-2 text-sm text-[#8ea0b8]">
                        {latestHistory?.changed_by_name || "System"} • {latestHistory?.trigger_source || "manual"}
                    </p>
                </div>
            </div>

            {currentBlogStatus.length > 0 && (
                <div className="rounded-[22px] border border-white/8 bg-[#151d2c] p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                        Platform Status Snapshot
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {currentBlogStatus.map((item) => (
                            <div
                                key={item.platformId}
                                className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-4"
                            >
                                <p className="text-sm font-semibold text-[#eef4ff]">{item.platformName}</p>
                                <p className="mt-2 text-sm text-[#dbe5f3]">
                                    Status: {statusLabelMap[item.publishStatus] || "Draft"}
                                </p>
                                <p className="mt-1 truncate text-sm text-[#8ea0b8]">
                                    Slug: {item.slug}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-[22px] border border-white/8 bg-[#151d2c] p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                        Activity Timeline
                    </p>
                    <span className="text-xs text-[#8ea0b8]">
                        {publishHistoryLoading ? "Loading..." : `${publishHistory.length} events`}
                    </span>
                </div>

                {publishHistoryLoading ? (
                    <div className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-[#101826] px-4 py-8 text-sm text-[#8ea0b8]">
                        Loading publish history...
                    </div>
                ) : publishHistory.length > 0 ? (
                    <div className="mt-4 space-y-3">
                        {publishHistory.slice(0, 8).map((historyItem) => {
                            const changedFields = parseChangedFields(
                                historyItem.changed_fields,
                                historyItem.change_field,
                            );

                            return (
                                <div
                                    key={historyItem.id}
                                    className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-4"
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2 justify-between w-full flex-wrap">
                                                <p className="text-sm font-semibold text-[#eef4ff]">
                                                    {formatFieldLabel(historyItem.action_type)} {formatFieldLabel(historyItem.entity_type)}
                                                </p>
                                                <span className="text-xs text-[#8ea0b8]">
                                                    {historyItem.created_at ? formatDateTime(historyItem.created_at) : "—"}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-[#dbe5f3]">
                                                {changedFields.length > 0 ? changedFields.join(", ") : "Details unavailable"}
                                            </p>
                                            <p className="mt-2 text-xs text-[#8ea0b8]">
                                                {historyItem.changed_by_name || "System"} • {historyItem.trigger_source || "manual"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-[#101826] px-4 py-8 text-sm text-[#8ea0b8]">
                        No publish tracking events available for this blog yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishStatusTracking;
