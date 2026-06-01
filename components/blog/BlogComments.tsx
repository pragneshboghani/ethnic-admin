"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BlogCommentAction from "@/actions/BlogCommentAction";
import { formatDateTime } from "@/utils/formatDateTime";
import { X } from "lucide-react";

type BlogCommentsProps = {
    blogId: string | null;
};

const BlogComments = ({ blogId }: BlogCommentsProps) => {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const cardClass = "rounded-[20px] border border-white/10 bg-[#101826] p-4";
    const pillClass = "rounded-full border border-white/10 bg-[#101826] px-3 py-1";
    const platformBadgeClass = "inline-block rounded-full bg-blue-500/20 px-3 py-1 text-[11px] uppercase font-medium text-blue-300 border border-blue-500/10";
    const emptyStateClass = "rounded-[22px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 text-center text-sm text-[#8ea0b8]";

    const loadComments = async () => {
        if (!blogId) {
            setComments([]); return;
        }

        setLoading(true);

        try {
            const res = await BlogCommentAction.fetchComments(Number(blogId));
            if (res.success) {
                setComments(res.commentData || []);
            } else {
                toast.error(res.message || "Failed to load comments");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadComments();
    }, [blogId]);

    const handleOpenComment = (comment: any) => {
        setSelectedComment(comment);
        setReplyText(comment.admin_reply || "");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedComment(null);
        setReplyText("");
        setIsModalOpen(false);
    };

    const handleUpdateStatus = async (status: "approved" | "rejected" | "hold") => {
        if (!selectedComment) return;

        setActionLoading(true);

        try {
            const res = await BlogCommentAction.updateCommentStatus(selectedComment.id, status);

            if (res.success) {
                toast.success(res.message || "Comment status updated");
                await loadComments();
                setSelectedComment({ ...selectedComment, comment_status: status });
            } else {
                toast.error(res.message || "Unable to update comment status");
            }
        } catch (error: any) {
            toast.error(error.message || "Unable to update comment status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveReply = async () => {
        if (!selectedComment) return;

        setActionLoading(true);

        try {
            const res = await BlogCommentAction.replyToComment(selectedComment.id, replyText);

            if (res.success) {
                toast.success(res.message || "Reply saved successfully");
                await loadComments();
                setSelectedComment({ ...selectedComment, admin_reply: replyText });
            } else {
                toast.error(res.message || "Unable to save reply");
            }
        } catch (error: any) {
            toast.error(error.message || "Unable to save reply");
        } finally {
            setActionLoading(false);
        }
    };

    const renderStatusBadge = (status: string) => {
        const baseClass = "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] border";

        const statusClasses = {
            approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
            rejected: "bg-rose-500/10 text-rose-300 border-rose-500/10",
            hold: "bg-amber-500/10 text-amber-300 border-amber-500/10",
        };

        return (
            <span className={`${baseClass} ${statusClasses[status as keyof typeof statusClasses] || statusClasses.hold}`} >
                {status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending"}
            </span>
        );
    };

    const handleDeleteComment = async (commentId: number) => {
        setActionLoading(true);

        try {
            const res = await BlogCommentAction.deleteComment(commentId);

            if (res.success) {
                toast.success(res.message || "Comment deleted successfully");
                await loadComments();
                handleCloseModal();
            } else {
                toast.error(res.message || "Unable to delete comment");
            }
        } catch (error: any) {
            toast.error(error.message || "Unable to delete comment");
        } finally {
            setActionLoading(false);
        }
    }
    return (
        <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] md:p-8">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
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
                        Total: {comments.length}
                    </span>

                    <span className={pillClass}>
                        Pending: {comments.filter((comment) => comment.comment_status === "hold").length}
                    </span>
                </div>
            </div>

            <div className="mt-6">
                {!blogId ? (
                    <div className={emptyStateClass}>
                        Save or publish the blog before comments can be loaded and moderated.
                    </div>
                ) : loading ? (
                    <div className={emptyStateClass}>
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div className={emptyStateClass}>
                        No comments yet for this blog.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <button key={comment.id} type="button" onClick={() => handleOpenComment(comment)} className="w-full rounded-[22px] border border-white/8 bg-[#101826] p-4 text-left transition hover:border-[#31425e] hover:bg-[#182438]" >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#eef4ff]">
                                            {comment.commentor_name || "Anonymous"}
                                        </p>

                                        <p className="mt-1 text-sm text-[#8ea0b8]">
                                            {comment.commentor_email || "No email provided"}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 sm:mt-0">
                                        {comment.platform_name && (
                                            <span className={platformBadgeClass}>
                                                {comment.platform_name}
                                            </span>
                                        )}
                                        {renderStatusBadge(comment.comment_status)}
                                    </div>
                                </div>

                                <div className="mt-3 line-clamp-3 text-sm leading-6 text-[#dbe5f3]"
                                    dangerouslySetInnerHTML={{
                                        __html: comment.comment || "No comment text available."
                                    }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedComment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#101826] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h4 className="text-xl font-semibold text-[#eef4ff]">
                                    Comment Details
                                </h4>

                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Approve, reject, or reply to this comment directly from the blog editor.
                                </p>
                            </div>

                            <button type="button" onClick={handleCloseModal} className="cursor-pointer" >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                            {/* Left */}
                            <div className="space-y-4">
                                <div className={`${cardClass} flex gap-3`}>
                                    {selectedComment.platform_name && (
                                        <span className={platformBadgeClass}>
                                            {selectedComment.platform_name}
                                        </span>
                                    )}
                                    {renderStatusBadge(selectedComment.comment_status)}
                                </div>

                                <div className={cardClass}>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-[#eef4ff]">
                                            {selectedComment.commentor_name || "Anonymous"}
                                        </p>

                                        <p className="text-sm text-[#8ea0b8]">
                                            {selectedComment.commentor_email || "No email provided"}
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-[#dbe5f3]">
                                        {selectedComment.comment || "No comment text available."}
                                    </p>
                                </div>

                                <div className={cardClass}>
                                    <p className="mb-2 text-sm font-semibold text-[#eef4ff]">
                                        Admin Reply
                                    </p>

                                    <textarea value={replyText} rows={4} className="w-full rounded-[18px] border border-white/10 bg-[#0f1724] px-4 py-3 text-sm text-[#dbe5f3] placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none" placeholder="Write a reply to the comment..." onChange={(e) => setReplyText(e.target.value)} />
                                </div>
                            </div>

                            {/* Right */}
                            <div className="space-y-4">
                                <div className={cardClass}>
                                    <p className="text-sm font-semibold text-[#eef4ff]">
                                        Comment metadata
                                    </p>

                                    <div className="mt-4 space-y-3 text-sm text-[#8ea0b8]">
                                        <p>
                                            <span className="font-medium text-[#eef4ff]">
                                                Submitted:
                                            </span>{" "}
                                            {formatDateTime(selectedComment.created_at || selectedComment.updated_at || "Unknown")}
                                        </p>

                                        <p>
                                            <span className="font-medium text-[#eef4ff]">
                                                Status:
                                            </span>{" "}
                                            {selectedComment.comment_status || "hold"}
                                        </p>

                                        {selectedComment.admins_reply && selectedComment.admins_reply.length > 0 && (
                                            selectedComment.admins_reply.map((reply: any, index: number) => {
                                                if (reply.type !== "reply") {
                                                    return null;
                                                }
                                                return (
                                                    <p key={index}>
                                                        <span className="font-medium text-[#eef4ff]">
                                                            {reply.adminData?.name || "Admin"}:
                                                        </span>{" "}
                                                        {reply.admin_reply}
                                                    </p>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className={cardClass}>
                                    <p className="text-sm font-semibold text-[#eef4ff]">
                                        Actions
                                    </p>

                                    <div className="mt-4 flex flex-col gap-3">
                                        <button type="button" disabled={actionLoading} className="btn !shadow-none" onClick={() => void handleUpdateStatus("approved")}>
                                            Approve
                                        </button>

                                        <button type="button" disabled={actionLoading} className="rounded-xl border border-white/10 bg-[#0f1724] px-4 py-2 text-sm text-[#dbe5f3] transition hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer" onClick={() => void handleUpdateStatus("rejected")}>
                                            Reject
                                        </button>

                                        <button type="button" onClick={() => void handleSaveReply()} disabled={actionLoading} className="btn !shadow-none">
                                            Save Reply
                                        </button>

                                        <button type="button" disabled={actionLoading} className="rounded-xl border border-white/10 bg-[#0f1724] px-4 py-2 text-sm text-[#dbe5f3] transition hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer" onClick={() => void handleDeleteComment(selectedComment.id)}>
                                            Delete Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogComments;