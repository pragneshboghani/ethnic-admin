"use client";

import BlogCommentAction from '@/actions/BlogCommentAction';
import BlogCommentPopup from '@/components/blog/BlogCommentPopup';
import renderStatusBadge from '@/components/blog/renderStatusBadge';
import type { comments as CommentType, groupedComments } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react'

const pillClass = "rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1";
const emptyStateClass = "rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-10 text-center text-sm text-[var(--text-muted)]";
const activeClass =
    "rounded-full border border-[var(--border-strong)] bg-[var(--bg-selected)] px-3 py-1.5 text-sm text-[var(--text-strong)] transition-all";
const normalClass =
    "rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]";

const BlogCommentpage = () => {
    const [comments, setComments] = useState<groupedComments[]>([]);
    const [platformTabs, setPlatformTabs] = useState<groupedComments[]>([]);
    const [activeTab, setActiveTab] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState<CommentType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchComments = useCallback(async (platformName = '') => {
        try {
            setLoading(true);
            const data = await BlogCommentAction.fetchAllComments();
            setComments(data.data);
            setPlatformTabs(data.data);

            const nextActiveTab = data.data.some((platform: groupedComments) => platform.platform_name === platformName)
                ? platformName
                : data.data[0]?.platform_name;

            if (nextActiveTab) {
                setActiveTab(nextActiveTab);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const activePlatform = comments.find(
        item => item.platform_name === activeTab
    );
    const activePlatformStats = platformTabs.find(
        item => item.platform_name === activeTab
    );

    const handlePlatformChange = async (platformName: string) => {
        setActiveTab(platformName);

        if (statusFilter === "all") {
            return;
        }

        try {
            setLoading(true);
            const data = await BlogCommentAction.fetchAllComments({
                comment_status: statusFilter,
                platform_name: platformName
            });

            setComments(data.data);
        } catch (error) {
            console.error("Error filtering comments by platform:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (status: string) => {
        try {
            setLoading(true);
            setStatusFilter(status);

            if (status === "all") {
                await fetchComments(activeTab);
                return;
            }

            const data = await BlogCommentAction.fetchAllComments({
                comment_status: status,
                platform_name: activeTab
            });

            setComments(data.data);
        } catch (error) {
            console.error("Error filtering comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenComment = (comment: CommentType) => {
        setSelectedComment(comment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedComment(null);
        setIsModalOpen(false);
    };

    const filterButtons = [{
        label: 'All',
        value: 'all',
        onClick: () => handleFilterChange("all"),
        className: statusFilter === "all" ? activeClass : normalClass
    }, {
        label: 'Approved',
        value: 'approved',
        onClick: () => handleFilterChange("approved"),
        className: statusFilter === "approved" ? activeClass : normalClass
    }, {
        label: 'Rejected',
        value: 'rejected',
        onClick: () => handleFilterChange("rejected"),
        className: statusFilter === "rejected" ? activeClass : normalClass
    }, {
        label: 'Pending',
        value: 'hold',
        onClick: () => handleFilterChange("hold"),
        className: statusFilter === "hold" ? activeClass : normalClass
    }]

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 lg:min-h-[77vh] lg:min-w-[300px]">
                    <div className="flex flex-row md:flex-col flex-wrap gap-4 sticky top-5">
                        {platformTabs.map((platform) => (
                            <button
                                type="button"
                                key={platform.platform_name}
                                onClick={() => handlePlatformChange(platform.platform_name)}
                                className={`group flex w-fit md:w-full items-center gap-3 rounded-2xl border p-2 sm:p-3 md:px-4 md:py-3 transition-all duration-200 ${activeTab === platform.platform_name
                                    ? "border-[var(--border-strong)] bg-[var(--bg-selected)] text-[var(--text-strong)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                                    : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-black/[0.03] hover:text-[var(--text-strong)]"
                                    }`}
                            >
                                {platform.platform_name}
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs uppercase ${activeTab === platform.platform_name
                                        ? 'bg-[var(--bg-selected)] text-[#294770]'
                                        : 'bg-black/[0.04] text-[var(--text-muted)]'
                                        }`}
                                >
                                    {platform.comments.length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] md:p-8">
                    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                                Comments
                            </h3>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Review visitor feedback and moderate comments for this blog.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-[var(--text)]">
                            <span className={pillClass}>
                                Total: {activePlatformStats ? activePlatformStats.comments.length : 0}
                            </span>

                            <span className={pillClass}>
                                Pending: {activePlatformStats ? activePlatformStats.comments.filter((comment) => comment.comment_status === "hold").length : 0}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {filterButtons.map((button) => (
                                <button key={button.value} type="button" onClick={button.onClick} className={button.className} >
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <div className={`${emptyStateClass} flex items-center justify-center gap-2`}>
                                <LoaderCircle className="h-6 w-6 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className={emptyStateClass}>
                                No comments yet for this blog.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {activePlatform?.comments?.map((comment) => (
                                    <button key={comment.comment_id} type="button" onClick={() => handleOpenComment(comment)} className="w-full rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-strong)]">
                                                    {comment.commentor_name || "Anonymous"}
                                                </p>

                                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                    {comment.commentor_email || "No email provided"}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 sm:mt-0">
                                                {renderStatusBadge(comment.comment_status)}
                                            </div>
                                        </div>

                                        <p className="text-sm font-semibold text-[var(--text-strong)] mt-3">
                                            Blog : {comment.blog_title || "Blog Title"}
                                        </p>
                                        <div
                                            className="mt-3 text-sm leading-6 text-[var(--text)]"
                                            dangerouslySetInnerHTML={{
                                                __html: comment.comment || "No comment text available."
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && selectedComment && (
                <BlogCommentPopup onClose={handleCloseModal} selectedComment={selectedComment} setSelectedComment={setSelectedComment} loadComments={() => fetchComments(activeTab)} />
            )}
        </>
    )
}

export default BlogCommentpage 
