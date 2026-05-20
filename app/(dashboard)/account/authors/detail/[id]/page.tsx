"use client";

import AuthorActions from "@/actions/AuthorActions";
import Image from "next/image";
import { ShieldCheck, User2, UserPen, UsersRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type AuthorDetailType = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  created_at?: string;
  description?: string;
  user_groups?: {
    name: string;
    description: string;
    image: string;
    id: number;
  }[];
};

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;
const AuthorDetailPage = () => {
  const params = useParams();
  const id = params.id;

  const [author, setAuthor] = useState<AuthorDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id?: number; role?: string } | null>(null);

  useEffect(() => {
    const getAuthor = async () => {
      try {
        setLoading(true);

        const res = await AuthorActions.getAuthorById(Number(id));

        if (res?.success === false) {
          setAuthor(null);
          return;
        }

        setAuthor(res?.data || res);
      } catch (error) {
        console.error("Failed to fetch author", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      setCurrentUser(AuthorActions.getCurrentUserRole());
      getAuthor();
    }
  }, [id]);

  const detailCardClass =
    "rounded-[24px] border border-white/8 bg-[#151d2c] p-5";

  const labelClassName =
    "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

  const canManageAllUsers = currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const canEditAuthor = Boolean(
    author &&
    (currentUser?.id === author.id ||
      canManageAllUsers),
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-[#8ea0b8]">
          Loading author details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[24px] border border-white/8 bg-[#151d2c]/95 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-[#101826]">
              {author?.profile_image ? (
                <Image
                  src={`${BACKEND_DOMAIN}/${author.profile_image}`}
                  alt={author?.name}
                  fill
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User2
                    size={36}
                    className="text-[#8ea0b8]"
                  />
                </div>
              )}
            </div>

            <div>
              <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8]">
                Author Details
              </span>

              <h1 className="mt-4 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#eef4ff] flex gap-5 items-center">
                {author?.name || "N/A"}
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-[#101826] px-4 py-3">
                    <ShieldCheck
                      size={18}
                      className="text-[#8ea0b8]"
                    />

                    <span className="text-sm font-medium text-[#eef4ff] capitalize">
                      {author?.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8ea0b8]">
                View complete author profile information and
                account details.
              </p>
            </div>
          </div>

          {canEditAuthor && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/account/authors/add/${author?.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-[#101826] px-4 py-3">
                <UserPen size={18} className="text-[#8ea0b8]" />
                <span className="text-sm font-medium text-[#eef4ff]">
                  Edit Profile
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-6">
        <div className={detailCardClass}>
          <div className="border-b border-white/8 pb-4">
            <h2 className="text-lg font-semibold text-[#eef4ff]">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-[#8ea0b8]">
              General details related to this author account.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <p className={labelClassName}>
                Full Name
              </p>

              <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff]">
                {author?.name || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <p className={labelClassName}>
                Email
              </p>

              <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff]">
                {author?.email || "N/A"}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <p className={labelClassName}>
              Author Discription
            </p>

            <div
              className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: author?.description || "N/A",
              }}
            />
          </div>

          {author?.user_groups && author?.user_groups.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className={labelClassName}>
                Groups
              </p>

              <div className="rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] flex flex-col gap-5">
                {author?.user_groups?.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {group.image ?
                        <Image
                          src={`${BACKEND_DOMAIN}/${group.image}`}
                          alt={group?.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 min-h-12 min-w-12 rounded-xl object-cover border border-white/10 bg-[#101826]"
                        /> :
                        <UsersRound size={22} className="h-12 w-12 p-3 rounded-xl border border-white/10 bg-[#101826]" />
                      }

                      <div>
                        <h3 className="truncate text-lg font-semibold text-[#eef4ff]">
                          {group.name}
                        </h3>

                        <p className="mt-1 text-xs tracking-[0.2em] text-[#7f90a8]">
                          {group.description || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link href={`/account/authors/add/${id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-[#101826] px-4 py-3">
                        <UserPen size={18} className="text-[#8ea0b8]" />
                        <span className="text-sm font-medium text-[#eef4ff]">
                          {canManageAllUsers ? "Edit Detail" : "View Detail"}
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorDetailPage;
