"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BlogCommentAction from "@/actions/BlogCommentAction";
import renderStatusBadge from "./renderStatusBadge";
import BlogCommentPopup from "./BlogCommentPopup";

type BlogCommentsProps = {
    blogId: string | null;
};

const BlogComments = ({ blogId }: BlogCommentsProps) => {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pillClass = "rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1";
    const platformBadgeClass = "inline-block rounded-full bg-blue-500/20 px-3 py-1 text-[11px] uppercase font-medium text-blue-300 border border-blue-500/10";
    const emptyStateClass = "rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-10 text-center text-sm text-[var(--text-muted)]";

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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedComment(null);
        setIsModalOpen(false);
    };

    return (
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
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
                            <button key={comment.comment_id} type="button" onClick={() => handleOpenComment(comment)} className="w-full rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]" >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--text-strong)]">
                                            {comment.commentor_name || "Anonymous"}
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
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

                                <div className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text)]"
                                    dangerouslySetInnerHTML={{
                                        __html: comment.comment || "No comment text available."
                                    }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && selectedComment && (
                <BlogCommentPopup onClose={handleCloseModal} selectedComment={selectedComment} setSelectedComment={setSelectedComment} loadComments={loadComments} />
            )}
        </div>
    );
};

export default BlogComments;