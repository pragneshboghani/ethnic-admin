"use client";

import AuthorActions from "@/actions/AuthorActions";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import { CheckCircle2, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import { toast } from "react-toastify";
import RichTextToolbar from "../blog/RichTextToolbar";
import PasswordInput from "../common/PasswordInput";
import { Author, AuthorFormData, AuthorFormProps, Role } from "@/types";
import { roleLabels } from "@/enum/roleLabels";
import DashBoardActions from "@/actions/DashboardAction";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;
const allowedRoles: Record<Role, string[]> = {
  super_admin: ["admin", "sub_admin"],
  admin: ["sub_admin"],
  sub_admin: [],
};

const cardClassName =
  "rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]";

const inputClassName =
  "w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[var(--accent)] focus:outline-none";

const selectClassName =
  "w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] transition focus:border-[var(--accent)] focus:outline-none";

const labelClassName =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]";

const getDefaultRole = (userRole: Role | null) => {
  const roles = allowedRoles[userRole || "sub_admin"];
  return roles[0] || "sub_admin";
};

const AuthorForm = ({ mode, initialData }: AuthorFormProps) => {
  const router = useRouter();
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: number; role?: string; name?: string; email?: string } | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [authorList, setAuthorList] = useState<Author[]>([]);
  const [userList, setUserList] = useState<Author[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);

  const formId = mode === "create" ? "author-create-form" : "author-update-form";
  const isUpdate = mode === "update";

  const { register, handleSubmit, setValue, reset, watch, control, formState: { errors }, } = useForm<AuthorFormData>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || "sub_admin",
      admin_id: initialData?.admin_id || undefined,
      profile_image: initialData?.profile_image || "",
      description: initialData?.description || "",
      members: initialData?.user_groups?.flatMap((group) =>
        group.members?.map((member) => Number(member.id)) || [],
      ) || [],
      social_links: {
        linkedin: initialData?.social_links?.linkedin || "",
      },
      can_access_calendar: initialData?.can_access_calendar ?? true,
    },
  });

  const previewImage = useWatch({ control, name: "profile_image" });
  const description = useWatch({ control, name: "description" });
  const selectedRole = useWatch({ control, name: "role" }) || (initialData?.role || "sub_admin");
  const calendarAccess = useWatch({ control, name: "can_access_calendar" }) ?? true;
  const selectedUsers = userList.filter((member) => selectedUserIds.includes(member.id));

  const toggleUserSelection = (memberId: number) => {
    const updatedIds = selectedUserIds.includes(memberId)
      ? selectedUserIds.filter((id) => id !== memberId)
      : [...selectedUserIds, memberId];

    setSelectedUserIds(updatedIds);
    setValue("members", updatedIds, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const currentUser = AuthorActions.getCurrentUser();
      if (currentUser) {
        setUserRole(currentUser.role as Role);
        setCurrentUser(currentUser);
      }
      try {
        const adminList = await AuthorActions.getAdminList();
        if (adminList.success) {
          setAuthorList(adminList.data || []);
        }
        const userList = await AuthorActions.getSubAdminList();
        if (userList.success) {
          setUserList(userList.data || []);
        }
        const res = await DashBoardActions.getAllData();
        setPlatformData(res.plateformData);
      } catch (error) {
        console.error("Failed to fetch admin list", error);
      }
      setRoleLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!initialData?.admin_id) return;
    if (!authorList || authorList.length === 0) return;

    const exists = authorList.some((a) => Number(a.id) === Number(initialData.admin_id));
    if (exists) {
      setValue("admin_id", Number(initialData.admin_id), {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
    setSelectedPlatforms(initialData.selected_platforms || []);
  }, [authorList, initialData, setValue]);

  useEffect(() => {
    if (!initialData?.user_groups || !userList.length) {
      return;
    }

    const selectedIds = initialData.user_groups.flatMap((group) =>
      group.members?.map((member) => Number(member.id)) || [],
    );

    if (!selectedIds.length) {
      return;
    }

    setSelectedUserIds((current) => {
      if (current.length) return current;
      return Array.from(new Set(selectedIds));
    });
    setValue("members", Array.from(new Set(selectedIds)), {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [initialData, userList, setValue]);

  useEffect(() => {
    if (selectedRole === "sub_admin") {
      if (userRole === "admin" && currentUser?.id) {
        setValue("admin_id", currentUser.id, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } else {
      setValue("admin_id", undefined, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [selectedRole, userRole, currentUser, setValue]);

  useEffect(() => {
    const defaultRole = initialData?.role || getDefaultRole(userRole);

    reset({
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: defaultRole,
      admin_id: initialData?.admin_id || undefined,
      profile_image: initialData?.profile_image || "",
      description: initialData?.description || "",
      members: initialData?.user_groups?.flatMap((group) =>
        group.members?.map((member) => Number(member.id)) || [],
      ) || [],
      social_links: {
        linkedin: initialData?.social_links?.linkedin || "",
      },
      can_access_calendar: initialData?.can_access_calendar ?? true,
    });
  }, [initialData, reset, userRole]);

  const roles = allowedRoles[userRole || "sub_admin"];
  const allowedRoleOptions =
    isUpdate && initialData?.role && !roles.includes(initialData.role)
      ? [initialData.role, ...roles]
      : roles;

  const canChangePassword = (() => {
    if (!isUpdate || !initialData) {
      return true;
    }

    const targetRole = initialData.role as Role;
    if (currentUser?.role === "super_admin") {
      return true;
    }

    if (targetRole === "super_admin") {
      return false;
    }

    if (targetRole === "admin") {
      return currentUser?.id === initialData.id;
    }

    if (targetRole === "sub_admin") {
      return (
        currentUser?.id === initialData.id ||
        currentUser?.role === "admin"
      );
    }

    return false;
  })();

  if (mode === "create" && roleLoaded && allowedRoleOptions.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          You are not allowed to create users.
        </p>
      </div>
    );
  }

  const canManageAuthors = userRole === "admin" || userRole === "super_admin";
  const isReadOnly = !canManageAuthors;

  const onSubmit = async (data: AuthorFormData) => {
    const canKeepExistingRole =
      isUpdate && initialData?.role && data.role === initialData.role;

    if (!allowedRoles[userRole || "sub_admin"]?.includes(data.role) && !canKeepExistingRole) {
      toast.error("You are not allowed to assign this role");
      return;
    }

    const payload = {
      ...data,
      selectedPlatforms,
      password: data.password?.trim() || undefined,
      admin_id: data.admin_id && !Number.isNaN(Number(data.admin_id)) ? Number(data.admin_id) : undefined,
    };

    const response =
      isUpdate && initialData?.id
        ? await AuthorActions.updateAuthor(initialData.id, payload)
        : await AuthorActions.createNewAuthor(payload);

    if (response.success) {
      toast.success(response.message);
      router.push(
        isUpdate && initialData?.id
          ? `/account/authors/detail/${initialData.id}`
          : "/account/authors",
      );
      return;
    }

    toast.error(response.message);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)]/95 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300">
          <div className="flex flex-col gap-4 transition-all duration-300 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-muted)] transition-all duration-300 opacity-100">
                Author Management
              </span>

              <h1 className="mt-4 text-[36px] font-semibold capitalize leading-none tracking-[-0.04em] text-[var(--text-strong)] transition-all duration-300">
                {isUpdate ? "Update Author" : "Create New Author"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)] transition-all duration-300 opacity-100">
                {isReadOnly
                  ? "You have view-only access. Only admins and super admins can make changes."
                  : isUpdate
                    ? "Update author profile information and access level."
                    : "Add a new author to your editorial workspace and assign the appropriate access level."}
              </p>
            </div>

            {!isReadOnly && (
              <button
                type="submit"
                form={formId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[var(--accent-hover)]"
              >
                <Save size={18} /> {isUpdate ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Left Section */}
          <div className="col-span-2 rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                Author Details
              </h3>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {isReadOnly
                  ? "View author information (read-only mode)."
                  : isUpdate
                    ? "Change the information for this author account."
                    : "Fill in the required information to create a new author account."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5">
              {/* Author Name */}
              <div className="space-y-2">
                <label htmlFor="author-name" className={labelClassName}>
                  Full Name
                </label>

                <input
                  id="author-name"
                  type="text"
                  disabled={isReadOnly}
                  className={inputClassName}
                  placeholder="Enter full name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />

                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Author: Firstname Lastname */}
              <div className="space-y-2">
                <label htmlFor="author-email" className={labelClassName}>
                  Email Address
                </label>

                <input
                  id="author-email"
                  type="email"
                  disabled={isReadOnly || isUpdate}
                  className={inputClassName}
                  placeholder="Enter email address"
                  {...register("email", {
                    required: "Email is required",
                  })}
                />

                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              {canChangePassword && (
                <div className="py-3 space-y-4">
                  {isUpdate && canChangePassword && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-strong)] accent-white"
                      />

                      <span className="text-sm text-[var(--text)]">
                        Want to change password?
                      </span>
                    </label>
                  )}

                  {(!isUpdate || (isUpdate && canChangePassword && changePassword)) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <PasswordInput disabled={isReadOnly} label="Password" id="author-password" className={inputClassName} labelClassName={labelClassName} error={errors.password?.message}
                        placeholder={isUpdate ? "Enter new password" : "Enter password"}
                        {...register("password", {
                          required: !isUpdate
                            ? "Password is required"
                            : false,
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />

                      <PasswordInput disabled={isReadOnly} label="Confirm Password" id="author-confirm-password" className={inputClassName} labelClassName={labelClassName} error={errors.confirmPassword?.message}
                        placeholder={isUpdate ? "Confirm new password" : "Confirm password"}
                        {...register("confirmPassword", {
                          required: !isUpdate
                            ? "Confirm password is required"
                            : false,
                          validate: (value) => {
                            if ((!isUpdate || changePassword) && value !== watch("password")) {
                              return "Passwords do not match";
                            }
                            return true;
                          },
                        })}
                      />
                    </div>
                  )}
                </div>
              )}

              {initialData?.role != "super_admin" && (
                <>
                  {/* Role */}
                  <div className="space-y-2">
                    <label htmlFor="author-role" className={labelClassName}>
                      Role
                    </label>

                    <select
                      id="author-role"
                      disabled={isReadOnly || allowedRoleOptions.length === 0}
                      className={selectClassName}
                      {...register("role")}
                    >
                      {allowedRoleOptions.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role] || role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Calendar access */}
                  {canManageAuthors && selectedRole !== "super_admin" && (
                    <div className="space-y-2">
                      <label className={labelClassName}>Content Calendar</label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={calendarAccess}
                        onClick={() => setValue("can_access_calendar", !calendarAccess, { shouldDirty: true })}
                        className="flex w-full items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-left transition hover:border-[var(--border-strong)]"
                      >
                        <span className="text-sm text-[var(--text-strong)]">
                          {calendarAccess ? "Access granted" : "Access revoked"}
                        </span>
                        <span
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            calendarAccess ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.2)] transition-transform ${
                              calendarAccess ? "translate-x-[22px]" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                      </button>
                      <p className="text-xs leading-5 text-[var(--text-muted)]">
                        Controls whether this author can open the Content Calendar and Projects pages.
                      </p>
                    </div>
                  )}

                  {/* Admin */}
                  {selectedRole === "sub_admin" && (
                    <div className="space-y-2">
                      <label htmlFor="author-admin" className={labelClassName}>
                        Assign Admin
                      </label>

                      {userRole === "admin" ? (
                        <>
                          <input
                            id="author-admin"
                            type="text"
                            className={inputClassName}
                            value={currentUser?.name ? `${currentUser.name} (${currentUser.email || ""})` : "Current admin"}
                            disabled
                          />
                          <input
                            type="hidden"
                            {...register("admin_id")}
                          />
                        </>
                      ) : (
                        <select
                          id="author-admin"
                          disabled={isReadOnly}
                          className={selectClassName}
                          {...register("admin_id", { valueAsNumber: true })}
                        >
                          <option value="">Select Admin</option>
                          {authorList.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.email})
                            </option>
                          ))}
                        </select>
                      )}

                      {userRole !== "admin" && authorList.length === 0 && (
                        <p className="text-xs text-[var(--text-muted)]">No admins available to assign.</p>
                      )}
                    </div>
                  )}

                  {/* Groups */}
                  {selectedRole === 'admin' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <label className={labelClassName}>Groups</label>

                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Select or deselect available users.
                          </p>
                        </div>

                        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-1 text-xs text-[var(--text-muted)]">
                          {selectedUserIds.length} selected
                        </span>
                      </div>

                      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                        {selectedUsers.length > 0 ? (
                          <div>
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                              Selected Members
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {selectedUsers.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => toggleUserSelection(member.id)}
                                  className={`rounded-full border border-[#c1dde1] bg-[var(--bg-selected)] px-3 py-1.5 text-sm font-medium text-[var(--status-green-text)] transition ${isReadOnly
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:border-[#c1dee1] hover:bg-[var(--bg-selected)] cursor-pointer"
                                    }`}
                                >
                                  {member.name || member.email} {!isReadOnly && "×"}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--text-muted)]">
                            No users selected yet.
                          </p>
                        )}

                        <div className="mt-4">
                          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                            All Members
                          </p>

                          <div className="flex flex-wrap gap-3">
                            {userList.length > 0 ? (
                              userList.map((member) => {
                                const isSelected = selectedUserIds.includes(member.id);

                                return (
                                  <button
                                    key={member.id}
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => toggleUserSelection(member.id)}
                                    aria-pressed={isSelected}
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isReadOnly
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                      } ${isSelected
                                        ? "border-[#c1dde1] bg-[var(--bg-selected)] text-[var(--status-green-text)]"
                                        : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                                      }`}
                                  >
                                    {member.name || member.email}
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-sm text-[var(--text-muted)]">
                                No sub admins available for selection.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className={labelClassName}>Description</p>
                  <p className="text-xs text-[var(--text-faint)]">Rich text editor with HTML mode support</p>
                </div>

                <div className="blog-editor overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--bg-inset)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <EditorProvider>
                    {!isReadOnly && <RichTextToolbar platformData={null} content={description || ""} />}
                    <Editor
                      value={description || ""}
                      onChange={(e) =>
                        !isReadOnly &&
                        setValue("description", e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      containerProps={{
                        className: "min-h-[260px] border-0 bg-[var(--bg-surface)] shadow-none",
                      }}
                      className="min-h-[260px] bg-[var(--bg-surface)] px-4 py-4 text-sm leading-7 text-[var(--text)] focus:outline-none"
                      placeholder="Write author description here or switch to HTML mode..."
                    />
                  </EditorProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-span-2 h-fit w-full space-y-6 lg:col-span-1">
            {/* Profile Image */}
            <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[24px] p-6">
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">
                  Profile Image
                </h3>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Upload profile image for the author account.
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setOpenMediaModal(true)}
                  className={`group flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] px-6 py-10 transition ${isReadOnly
                    ? "cursor-not-allowed opacity-50"
                    : "hover:border-[var(--accent)]"
                    }`}
                >
                  {previewImage ? (
                    <div className="flex flex-col items-center">
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[var(--border)]">
                        <Image
                          fill
                          alt="Preview"
                          className="object-cover"
                          src={`${BACKEND_DOMAIN}/${previewImage}`}
                        />
                      </div>

                      <p className="mt-4 text-sm text-[var(--text-muted)]">
                        {isReadOnly ? "Image" : "Click to change image"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)]">
                        <Save size={28} className="text-[var(--text-muted)]" />
                      </div>

                      <p className="mt-4 text-sm font-medium text-[var(--text-strong)]">
                        Select Profile Image
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Choose image from media library
                      </p>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Medias */}
            <div className={cardClassName}>
              <div className="border-b border-[var(--border)] pb-5">
                <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                  Social Medias
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  Add social media links to your profile.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="linkedin" className={labelClassName}>
                    linkedin
                  </label>

                  <input
                    id="linkedin"
                    type="text"
                    disabled={isReadOnly}
                    className={inputClassName}
                    placeholder="https://linkedin.com/in/username"
                    {...register("social_links.linkedin")}
                  />

                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Target Platforms */}
            <div className={cardClassName}>
              <div className="border-b border-[var(--border)] pb-5">
                <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                  Target Platforms
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  Select the websites where you want to publish this user and then fine-tune each destination.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                {platformData?.map((platform: any) => {
                  const showPlatform =
                    platform.status === "Active" &&
                    (
                      platform.data_source === "admin" ||
                      (platform.data_source === "platform" &&
                        platform.api_endpoint &&
                        platform.api_endpoint.trim() !== "")
                    );
                  const isSelected = selectedPlatforms.includes(platform.id);

                  if (!showPlatform) return null;

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatforms((prev) =>
                          prev.includes(platform.id)
                            ? prev.filter((id) => id !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                      className={`flex items-center gap-3 rounded-[20px] border p-4 text-left transition-all ${isSelected
                        ? "border-[var(--accent)] bg-[var(--bg-inset)] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                        : "border-[var(--border)] bg-[var(--bg-inset)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
                        }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${isSelected
                          ? "border-[var(--accent)] bg-[var(--bg-selected)] text-[var(--text-strong)]"
                          : "border-[var(--border)] bg-[var(--bg-surface)] text-transparent"
                          }`}
                      >
                        {1 == 1 && <CheckCircle2 size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-[var(--text-strong)]">{platform.platform_name}</div>
                        <div className="truncate text-xs text-[var(--text-muted)]">{platform.website_url}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </form>
      </div>

      <UploadMediaModal
        isOpen={openMediaModal}
        onClose={() => setOpenMediaModal(false)}
        allowedMediaType="image"
        onSelectImage={(url) => {
          setValue("profile_image", url);
        }}
      />
    </>
  );
};

export default AuthorForm;
