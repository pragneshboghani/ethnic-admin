"use client";

import BlogCommentAction from '@/actions/BlogCommentAction';
import BlogCommentPopup from '@/components/blog/BlogCommentPopup';
import renderStatusBadge from '@/components/blog/renderStatusBadge';
import type { comments as CommentType, groupedComments } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react'

const pillClass = "rounded-full border border-white/10 bg-[#101826] px-3 py-1";
const emptyStateClass = "rounded-[22px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 text-center text-sm text-[#8ea0b8]";
const activeClass =
    "rounded-full border border-[#2b3950] bg-[#1d2b42] px-3 py-1.5 text-sm text-white transition-all";
const normalClass =
    "rounded-full border border-white/10 bg-[#101826] px-3 py-1.5 text-sm text-[#8ea0b8] transition-all hover:border-white/20 hover:text-white";

const BlogCommentpage = () => {
    const [comments, setComments] = useState<groupedComments[]>([]);
    const [platformTabs, setPlatformTabs] = useState<groupedComments[]>([]);
    const [activeTab, setActiveTab] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState<CommentType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await BlogCommentAction.fetchAllComments();
            setComments(data.data);
            setPlatformTabs(data.data);

            if (data.data.length > 0) {
                setActiveTab(data.data[0].platform_name);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

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
                await fetchComments();
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
                <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5 lg:min-h-[77vh] lg:min-w-[300px]">
                    {loading ? (
                        <div className={`${emptyStateClass} flex items-center justify-center gap-2`}>
                            <LoaderCircle className="h-6 w-6 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-row md:flex-col flex-wrap gap-4 sticky top-5">
                            {platformTabs.map((platform) => (
                                <button
                                    type="button"
                                    key={platform.platform_name}
                                    onClick={() => handlePlatformChange(platform.platform_name)}
                                    className={`group flex w-fit md:w-full items-center gap-3 rounded-2xl border p-2 sm:p-3 md:px-4 md:py-3 transition-all duration-200 ${activeTab === platform.platform_name
                                        ? "border-[#2b3950] bg-[#182233] text-[#eef4ff] shadow-[0_16px_34px_rgba(0,0,0,0.24)]"
                                        : "border-transparent text-[#8fa0b6] hover:border-white/10 hover:bg-white/[0.03] hover:text-[#eef4ff]"
                                        }`}
                                >
                                    {platform.platform_name}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs uppercase ${activeTab === platform.platform_name
                                            ? 'bg-[#1d2b42] text-[#c8d7eb]'
                                            : 'bg-white/[0.05] text-[#8ea0b8]'
                                            }`}
                                    >
                                        {platform.comments.length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] md:p-8">
                    <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
                        <div>
                            <h3 className="text-lg font-semibold text-[#eef4ff]">
                                Comments
                            </h3>
                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                Review visitor feedback and moderate comments for this blog.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-[#dbe5f3]">
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
                                    <button key={comment.comment_id} type="button" onClick={() => handleOpenComment(comment)} className="w-full rounded-[22px] border border-white/8 bg-[#101826] p-4 text-left transition hover:border-[#31425e] hover:bg-[#182438]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold text-[#eef4ff]">
                                                    {comment.commentor_name || "Anonymous"}
                                                </p>

                                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                                    {comment.commentor_email || "No email provided"}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 sm:mt-0">
                                                {renderStatusBadge(comment.comment_status)}
                                            </div>
                                        </div>

                                        <p className="text-sm font-semibold text-[#eef4ff] mt-3">
                                            Blog : {comment.blog_title || "Blog Title"}
                                        </p>
                                        <div
                                            className="mt-3 text-sm leading-6 text-[#dbe5f3]"
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
                <BlogCommentPopup onClose={handleCloseModal} selectedComment={selectedComment} setSelectedComment={setSelectedComment} loadComments={fetchComments} />
            )}
        </>
    )
}

export default BlogCommentpage 
