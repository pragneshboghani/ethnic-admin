import { X } from 'lucide-react';
import React, { useState } from 'react'
import renderStatusBadge from './renderStatusBadge';
import { formatDateTime } from '@/utils/formatDateTime';
import BlogCommentAction from '@/actions/BlogCommentAction';
import { toast } from 'react-toastify';
import { BlogCommentPopupProps } from '@/types';

const cardClass = "rounded-[20px] border border-white/10 bg-[#101826] p-4";
const platformBadgeClass = "inline-block rounded-full bg-blue-500/20 px-3 py-1 text-[11px] uppercase font-medium text-blue-300 border border-blue-500/10";

const BlogCommentPopup = ({ onClose, selectedComment, setSelectedComment, loadComments }: BlogCommentPopupProps) => {
    const [replyText, setReplyText] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const handleUpdateStatus = async (status: "approved" | "rejected" | "hold") => {
        if (!selectedComment) return;

        setActionLoading(true);

        try {
            const res = await BlogCommentAction.updateCommentStatus(selectedComment.comment_id, status);

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
            const res = await BlogCommentAction.replyToComment(selectedComment.comment_id, replyText);

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

    const handleDeleteComment = async (commentId: number) => {
        setActionLoading(true);

        try {
            const res = await BlogCommentAction.deleteComment(commentId);

            if (res.success) {
                toast.success(res.message || "Comment deleted successfully");
                await loadComments();
                onClose();
            } else {
                toast.error(res.message || "Unable to delete comment");
            }
        } catch (error: any) {
            toast.error(error.message || "Unable to delete comment");
        } finally {
            setActionLoading(false);
        }
    };

    const actionButtons = [{
        label: "Approve",
        onClick: () => void handleUpdateStatus("approved"),
        className: "btn !shadow-none"
    },
    {
        label: "Reject",
        onClick: () => void handleUpdateStatus("rejected"),
        className: "rounded-xl border border-white/10 bg-[#0f1724] px-4 py-2 text-sm text-[#dbe5f3] transition hover:bg-white/[0.06]",
    }]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-3xl rounded-[24px] border border-white/10 bg-[#101826] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)] max-h-[95vh] overflow-y-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h4 className="text-xl font-semibold text-[#eef4ff]">
                            Comment Details
                        </h4>

                        <p className="mt-1 text-sm text-[#8ea0b8]">
                            Approve, reject, or reply to this comment directly from the blog editor.
                        </p>
                    </div>

                    <button type="button" onClick={onClose} className="cursor-pointer" >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {selectedComment.blog_title &&
                    <p className="mt-2 text-xl font-semibold text-[#eef4ff]">
                        Blog : {selectedComment.blog_title}
                    </p>
                }

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
                            <p className="mt-3 text-sm text-[#8ea0b8]">
                                {formatDateTime(selectedComment.created_at || selectedComment.updated_at || "Unknown")}
                            </p>

                        </div>

                        <div>
                            <textarea value={replyText} rows={4} className="w-full rounded-[18px] border border-white/10 bg-[#0f1724] px-4 py-3 text-sm text-[#dbe5f3] placeholder:text-[#6f8096] focus:border-[#31425e] focus:outline-none" placeholder="Write a reply to the comment..." onChange={(e) => setReplyText(e.target.value)} />
                            <button onClick={() => void handleSaveReply()} disabled={actionLoading || !replyText || replyText.trim() == ''} className={`btn !shadow-none disabled:cursor-not-allowed disabled:opacity-50`}>
                                Save Reply
                            </button>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="space-y-4">
                        {selectedComment.replies && selectedComment.replies.length > 0 && (
                            <div className={cardClass}>
                                <p className="text-sm font-semibold text-[#eef4ff]">
                                    Comment Replies
                                </p>

                                <div className="mt-4 space-y-3 text-sm text-[#8ea0b8]">
                                    {selectedComment.updated_by && (
                                        <p>
                                            <span className="font-medium text-[#eef4ff] mb-3">
                                                Status change by {selectedComment.status_updated_by.name || "Admin"}
                                            </span>
                                        </p>
                                    )}
                                    {selectedComment.replies.map((reply: any, index: number) => {
                                        return (
                                            <p key={index}>
                                                <span className="font-medium text-[#eef4ff]">
                                                    {reply.adminData?.name || "Admin"}:
                                                </span>{" "}
                                                {reply.admin_reply}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className={cardClass}>
                            <p className="text-sm font-semibold text-[#eef4ff]">
                                Actions
                            </p>

                            <div className="mt-4 flex flex-col gap-3">
                                {actionButtons.map((button, index) => (
                                    <button key={index} onClick={button.onClick} disabled={selectedComment.comment_status === "approved" || selectedComment.comment_status === "rejected" || actionLoading}
                                        className={`${button.className} disabled:cursor-not-allowed disabled:opacity-50`}>
                                        {button.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogCommentPopup