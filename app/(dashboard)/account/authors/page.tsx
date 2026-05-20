"use client";

import AuthorActions from "@/actions/AuthorActions";
import ClickOutside from "@/components/common/ClickOutside";
import { Authors } from "@/types";
import { Plus, Trash2, UserPen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const roleLabels: Record<string, string> = {
  admin: "Admin",
  sub_admin: "Users",
  super_admin: "Super Admin",
};

const Authers = () => {
    const [authors, setAuthors] = useState<Authors[]>([]);
    const [currentUser, setCurrentUser] = useState<{ id?: number; role?: string } | null>(null);
    const [deleteAuthor, setDeleteAuthor] = useState<Authors | null>(null);
    const canManageAllUsers = currentUser?.role === "super_admin" || currentUser?.role === "admin";
    const canDeleteAuthor = (author: Authors) =>
        currentUser?.role === "super_admin" &&
        ["admin", "sub_admin"].includes(author.role);

    const canUpdateAuthor = (author: Authors) => {
        if (currentUser?.id === author.id) {
            return true;
        }

        return canManageAllUsers;
    };

    const getAllAuthors = async () => {
        const authors = await AuthorActions.getAllAuthors();
        setAuthors(authors.data || []);
    }

    const handleDelete = async () => {
        if (!deleteAuthor) return;

        try {
            const response = await AuthorActions.deleteAuthor(deleteAuthor.id);

            if (response.success) {
                setAuthors((prev) => prev.filter((author) => author.id !== deleteAuthor.id));
                toast.success(response.message || "User deleted successfully");
                setDeleteAuthor(null);
                return;
            }

            toast.error(response.message || "Failed to delete user");
        } catch (error) {
            console.error("Delete user failed", error);
            toast.error("Failed to delete user");
        }
    };

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setCurrentUser(AuthorActions.getCurrentUserRole());
            getAllAuthors();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <>
            <aside className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">Users</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#eef4ff]">
                        Manage user profiles
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                        {canManageAllUsers
                            ? "View and update all users across the workspace."
                            : "View and update your own profile information."}
                    </p>
                </div>

                {canManageAllUsers && (
                    <Link
                        href="/account/authors/add"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                    >
                        <Plus size={18} />
                        Add User
                    </Link>
                )}
            </aside>
            <div className="mt-6 grid gap-5 grid-cols-1">
                {authors.map((author) => {
                    const authorImage = author.img_url ? `${BACKEND_DOMAIN}/${author.img_url}` : `${BACKEND_DOMAIN}/media/uploads/1778838787732-71l6q3owugj.jpeg`;
                    const canEditAuthor = canUpdateAuthor(author);
                    const showDeleteAuthor = canDeleteAuthor(author);

                    return (
                        <div key={author.id} className="rounded-[26px] border border-white/8 bg-[#151d2c] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:border-[#31425e]">
                            <div className="flex items-start justify-between gap-4">
                                <Link href={`/account/authors/detail/${author.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="inline-flex items-center justify-center rounded-[18px] border border-[#354b73]/30 bg-[#182438] text-[#c8daf9]">
                                        <div className="relative h-15 w-15 overflow-hidden rounded-[14px] bg-[#1d2a3f]">
                                            <Image src={authorImage} alt={author.name} fill
                                                className="object-cover object-top"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate text-[24px] font-semibold tracking-tight text-[#eef4ff]">
                                            {author.name}
                                        </h3>

                                        <p className="mt-1 text-sm capitalize text-[#8ea0b8]">
                                            {roleLabels[author.role]}
                                        </p>
                                    </div>
                                </Link>

                                {(canEditAuthor || showDeleteAuthor) && (
                                    <div className="flex flex-wrap justify-end gap-3">
                                        {canEditAuthor && (
                                            <Link
                                                href={`/account/authors/add/${author.id}`}
                                                className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-[#101826] px-4 py-3 text-sm font-medium text-[#eef4ff] transition hover:border-[#31425e]"
                                            >
                                                <UserPen size={18} className="text-[#8ea0b8]" />
                                                Edit
                                            </Link>
                                        )}

                                        {showDeleteAuthor && (
                                            <button
                                                type="button"
                                                onClick={() => setDeleteAuthor(author)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#b8664b]/40 bg-[#372423] px-4 py-3 text-sm font-medium text-[#ffd7c4] transition hover:bg-[#462a28]"
                                            >
                                                <Trash2 size={18} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {deleteAuthor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <ClickOutside onClickOutside={() => setDeleteAuthor(null)}>
                        <div className="w-full max-w-md rounded-[26px] border border-white/10 bg-[#101826] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">
                                Remove User
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold text-[#eef4ff]">
                                Delete {deleteAuthor.name}?
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                                This will permanently remove this {deleteAuthor.role.replace("_", " ")} account from the workspace.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteAuthor(null)}
                                    className="rounded-[16px] border border-white/10 px-4 py-2.5 text-sm font-medium text-[#b8c4d4] transition hover:bg-white/[0.04]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="rounded-[16px] border border-[#b8664b]/40 bg-[#372423] px-4 py-2.5 text-sm font-medium text-[#ffd7c4] transition hover:bg-[#462a28]"
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </ClickOutside>
                </div>
            )}
        </>
    );
};

export default Authers;
