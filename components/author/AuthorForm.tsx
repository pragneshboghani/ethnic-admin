"use client";

import AuthorActions from "@/actions/AuthorActions";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import { Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import { toast } from "react-toastify";
import RichTextToolbar from "../blog/RichTextToolbar";
import PasswordInput from "../common/PasswordInput";

export type Role = "super_admin" | "admin" | "sub_admin";

export type Author = {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export type AuthorFormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: string;
  admin_id?: number;
  profile_image: string;
  description: string;
};

export type AuthorInitialData = {
  id?: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  admin_id?: number;
  description?: string;
};

type AuthorFormProps = {
  mode: "create" | "update";
  initialData?: AuthorInitialData | null;
};

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

const allowedRoles: Record<Role, string[]> = {
  super_admin: ["admin", "sub_admin"],
  admin: ["sub_admin"],
  sub_admin: [],
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  sub_admin: "Sub Admin",
  super_admin: "Super Admin",
};

const inputClassName =
  "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";

const selectClassName =
  "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] transition focus:border-[#31425e] focus:outline-none";

const labelClassName =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

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
    },
  });

  const previewImage = useWatch({ control, name: "profile_image" });
  const description = useWatch({ control, name: "description" });
  const selectedRole = useWatch({ control, name: "role" }) || (initialData?.role || "sub_admin");

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
      } catch (error) {
        console.error("Failed to fetch admin list", error);
      }
      setRoleLoaded(true);
    };

    loadData();
  }, []);

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
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-white/8 bg-[#151d2c] p-6">
        <p className="text-sm text-[#8ea0b8]">
          You are not allowed to create users.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: AuthorFormData) => {
    const canKeepExistingRole =
      isUpdate && initialData?.role && data.role === initialData.role;

    if (!allowedRoles[userRole || "sub_admin"]?.includes(data.role) && !canKeepExistingRole) {
      toast.error("You are not allowed to assign this role");
      return;
    }

    const payload = {
      ...data,
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
        <div className="rounded-[24px] border border-white/8 bg-[#151d2c]/95 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300">
          <div className="flex flex-col gap-4 transition-all duration-300 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8] transition-all duration-300 opacity-100">
                Author Management
              </span>

              <h1 className="mt-4 text-[36px] font-semibold capitalize leading-none tracking-[-0.04em] text-[#eef4ff] transition-all duration-300">
                {isUpdate ? "Update Author" : "Create New Author"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8ea0b8] transition-all duration-300 opacity-100">
                {isUpdate
                  ? "Update author profile information and access level."
                  : "Add a new author to your editorial workspace and assign the appropriate access level."}
              </p>
            </div>

            <button
              type="submit"
              form={formId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
            >
              <Save size={18} /> {isUpdate ? "Update" : "Submit"}
            </button>
          </div>
        </div>

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="col-span-2 rounded-[24px] border border-white/8 bg-[#151d2c] p-6">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-lg font-semibold text-[#eef4ff]">
                Author Details
              </h3>

              <p className="mt-1 text-sm text-[#8ea0b8]">
                {isUpdate
                  ? "Change the information for this author account."
                  : "Fill in the required information to create a new author account."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label htmlFor="author-name" className={labelClassName}>
                  Full Name
                </label>

                <input
                  id="author-name"
                  type="text"
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

              <div className="space-y-2">
                <label htmlFor="author-email" className={labelClassName}>
                  Email Address
                </label>

                <input
                  id="author-email"
                  type="email"
                  readOnly={isUpdate}
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

              {canChangePassword && (
                <div className="py-3 space-y-4">
                  {isUpdate && canChangePassword && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-[#0f1724] text-white accent-white"
                      />

                      <span className="text-sm text-[#dbe5f3]">
                        Want to change password?
                      </span>
                    </label>
                  )}

                  {(!isUpdate || (isUpdate && canChangePassword && changePassword)) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <PasswordInput label="Password" id="author-password" className={inputClassName} labelClassName={labelClassName} error={errors.password?.message}
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

                      <PasswordInput label="Confirm Password" id="author-confirm-password" className={inputClassName} labelClassName={labelClassName} error={errors.confirmPassword?.message}
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

              <div className="space-y-2">
                <label htmlFor="author-role" className={labelClassName}>
                  Role
                </label>

                <select
                  id="author-role"
                  className={selectClassName}
                  {...register("role")}
                  disabled={allowedRoleOptions.length === 0}
                >
                  {allowedRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role] || role}
                    </option>
                  ))}
                </select>
              </div>

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
                    <p className="text-xs text-[#8ea0b8]">No admins available to assign.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className={labelClassName}>Description</p>
                  <p className="text-xs text-[#6f8096]">Rich text editor with HTML mode support</p>
                </div>

                <div className="blog-editor overflow-hidden rounded-[22px] border border-white/8 bg-[#101826] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <EditorProvider>
                    <RichTextToolbar platformData={null} content={description || ""} />
                    <Editor
                      value={description || ""}
                      onChange={(e) =>
                        setValue("description", e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      containerProps={{
                        className: "min-h-[260px] border-0 bg-[#0f1724] shadow-none",
                      }}
                      className="min-h-[260px] bg-[#0f1724] px-4 py-4 text-sm leading-7 text-[#dbe5f3] focus:outline-none"
                      placeholder="Write author description here or switch to HTML mode..."
                    />
                  </EditorProvider>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 h-fit w-full rounded-[24px] border border-white/8 bg-[#151d2c] p-6 lg:col-span-1">
            <div className="border-b border-white/8 pb-4">
              <h3 className="text-lg font-semibold text-[#eef4ff]">
                Profile Image
              </h3>

              <p className="mt-1 text-sm text-[#8ea0b8]">
                Upload profile image for the author account.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setOpenMediaModal(true)}
                className="group flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 transition hover:border-[#31425e]"
              >
                {previewImage ? (
                  <div className="flex flex-col items-center">
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10">
                      <Image
                        fill
                        alt="Preview"
                        className="object-cover"
                        src={`${BACKEND_DOMAIN}/${previewImage}`}
                      />
                    </div>

                    <p className="mt-4 text-sm text-[#8ea0b8]">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#151d2c]">
                      <Save size={28} className="text-[#8ea0b8]" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#eef4ff]">
                      Select Profile Image
                    </p>

                    <p className="mt-1 text-xs text-[#8ea0b8]">
                      Choose image from media library
                    </p>
                  </>
                )}
              </button>
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
