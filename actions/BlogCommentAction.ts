import { getHeaders } from "@/utils/getHeaders";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;
const BlogCommentAction = {
  async fetchComments(blogId: number) {
    try {
      const endpoint = `${BACKEND_DOMAIN || ""}/api/blog-comments/comment/get?blogId=${blogId}`;
      const res = await fetch(endpoint, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch comments");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      throw error;
    }
  },

  async fetchAllComments({ comment_status, platform_name }: { comment_status?: string, platform_name?: string } = {}) {
    try {
      const endpoint = `${BACKEND_DOMAIN || ""}/api/blog-comments/comment/get/all${comment_status ? `?comment_status=${comment_status}` : ""}${platform_name ? `&platform_name=${platform_name}` : ""}`;
      const res = await fetch(endpoint, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch comments");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error fetching all comments:", error.message);
      throw error;
    }
  },

  async updateCommentStatus(commentId: number, status: "approved" | "rejected" | "hold") {
    try {
      const endpoint = `${BACKEND_DOMAIN || ""}/api/blog-comments/comment/status`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ commentId, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update comment status");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error updating comment status:", error.message);
      throw error;
    }
  },

  async replyToComment(commentId: number, adminReply: string) {
    try {
      const endpoint = `${BACKEND_DOMAIN || ""}/api/blog-comments/comment/reply`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ commentId, adminReply }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save reply");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error replying to comment:", error.message);
      throw error;
    }
  },

  async deleteComment(commentId: number) {
    try {
      const endpoint = `${BACKEND_DOMAIN || ""}/api/blog-comments/comment/delete/${commentId}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      return await res.json();
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
      throw error;
    }
  }
};

export default BlogCommentAction;