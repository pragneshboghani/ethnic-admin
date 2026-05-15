"use client";

import AuthorActions from "@/actions/AuthorActions";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Role = "super_admin" | "admin" | "sub_admin";
type Authors = {
    id: number;
    name: string;
    email: string;
    role: Role;
    img_url: string;
};

type Permission =
    | "create_admin"
    | "create_sub_admin"
    | "edit_user"
    | "delete_user";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    super_admin: [
        "create_admin",
        "create_sub_admin",
        "edit_user",
        "delete_user",
    ],
    admin: [
        "create_sub_admin",
        "edit_user",
    ],
    sub_admin: [],
};

const BACKEND_DOMAIN = 'https://api-admin.ethnicinfotech.in';

const Authers = () => {
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [authors, setAuthors] = useState<Authors[]>([]);

    const getUserRole = async () => {
        const role = await AuthorActions.getCurrentUserRole();
        if (role) {
            setUserRole(role.role as Role);
        }
    };

    const getAllAuthors = async () => {
        const authors = await AuthorActions.getAllAuthors();
        setAuthors(authors.data);
    }
    useEffect(() => {
        getUserRole();
        getAllAuthors();
    }, []);

    const hasPermission = (permission: Permission) => {
        if (!userRole) return false;
        return ROLE_PERMISSIONS[userRole]?.includes(permission);
    };

    return (
        <>
            <aside className="flex flex-wrap justify-between gap-5 rounded-[24px] border border-white/8 bg-[#151d2c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8ea0b8]">Authors</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#eef4ff]">
                        Manage your content creators
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#8ea0b8]">
                        Add new authors, update profiles, and streamline
                        content ownership across all publishing destinations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {hasPermission("create_admin") && (
                        <Link
                            href={`/account/authors/add?role=admin`}
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                        >
                            <Plus size={16} />
                            Add Admin
                        </Link>
                    )}
                    {hasPermission("create_sub_admin") && (
                        <Link
                            href={`/account/authors/add?role=sub_admin`}
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                        >
                            <Plus size={16} />
                            Add Sub Admin
                        </Link>
                    )}
                </div>
            </aside>
            <div className="mt-6 grid gap-5 grid-cols-1">
                {authors.map((author) => {
                    const authorImage = author.img_url ? `${BACKEND_DOMAIN}/${author.img_url}` : `${BACKEND_DOMAIN}/media/uploads/1778838787732-71l6q3owugj.jpeg`;

                    return (
                        <div key={author.id} className="rounded-[26px] border border-white/8 bg-[#151d2c] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition hover:border-[#31425e]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
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
                                            {author.role.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default Authers;