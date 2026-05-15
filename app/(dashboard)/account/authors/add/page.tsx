"use client";

import Image from "next/image";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import AuthorActions from "@/actions/AuthorActions";
import { toast } from "react-toastify";
import { Role } from "../page";

type AuthorFormData = {
    name: string;
    email: string;
    password: string;
    role: string;
    profile_image: string;
};

const BACKEND_DOMAIN = 'https://api-admin.ethnicinfotech.in';
const AuthorCreatePage = () => {
    const [previewImage, setPreviewImage] = useState<string>("");
    const [openMediaModal, setOpenMediaModal] = useState(false);
    const [userRole, setUserRole] = useState<Role | null>(null);

    const inputClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";

    const selectClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] transition focus:border-[#31425e] focus:outline-none";

    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AuthorFormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: userRole === "super_admin" ? "admin" : "sub_admin",
            profile_image: "",
        },
    });

    // const selectedRole = watch("role");

    useEffect(() => {
        const getUserRole = async () => {
            const role = await AuthorActions.getCurrentUserRole();
            if (role) {
                const currentRole = role.role as Role;
                setUserRole(currentRole);

                reset({
                    name: "",
                    email: "",
                    password: "",
                    role: "sub_admin",
                    profile_image: "",
                });
            }
        };

        getUserRole();
    }, [reset]);

    const allowedRoles: Record<Role, string[]> = {
        super_admin: ["admin", "sub_admin"],
        admin: ["sub_admin"],
        sub_admin: [],
    };

    const onSubmit = async (data: AuthorFormData) => {
        if (!allowedRoles[userRole || "sub_admin"]?.includes(data.role)) {
            toast.error("You are not allowed to create this role");
            return;
        }

        const responce = await AuthorActions.createNewAuthor(data);
        if (responce.success) {
            toast.success(responce.message);
            window.location.href = "/account/authors";
        } else {
            toast.error(responce.message);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className={`rounded-[24px] border border-white/8 bg-[#151d2c]/95 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 p-6`}>
                    <div className={`flex flex-col gap-4 transition-all duration-300 xl:flex-row xl:items-center xl:justify-between xl:gap-8`}>
                        <div className="min-w-0">
                            <span className={`inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8] transition-all duration-300 opacity-100`}>
                                Author Management
                            </span>

                            <h1 className={`font-semibold tracking-[-0.04em] text-[#eef4ff] transition-all duration-300 mt-4 text-[36px] leading-none capitalize`}>
                                Create New Author
                            </h1>

                            <p className={`max-w-2xl text-sm leading-7 text-[#8ea0b8] transition-all duration-300 mt-3 opacity-100`}>
                                Add a new author to your editorial workspace and assign the appropriate access level.
                            </p>
                        </div>

                        <button type="submit" form="author-create-form" className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef4ff] text-sm font-semibold text-[#0f1724] transition hover:bg-white px-5 py-3`} >
                            <Save size={18} /> Submit
                        </button>
                    </div>
                </div>

                <form id="author-create-form" onSubmit={handleSubmit(onSubmit)} className="gap-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-6 col-span-2">
                        <div className="border-b border-white/8 pb-4">
                            <h3 className="text-lg font-semibold text-[#eef4ff]">
                                Author Details
                            </h3>

                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                Fill in the required information to create a new
                                author account.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-5 grid-cols-1">
                            <div className="space-y-2">
                                <label htmlFor="author-name" className={labelClassName}>
                                    Full Name
                                </label>

                                <input id="author-name" type="text" className={inputClassName}
                                    placeholder="Enter full name"
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                />

                                {errors.name && (
                                    <p className="text-xs text-red-400">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="author-email" className={labelClassName}>
                                    Email Address
                                </label>

                                <input id="author-email" type="email" className={inputClassName}
                                    placeholder="Enter email address"
                                    {...register("email", {
                                        required: "Email is required",
                                    })}
                                />

                                {errors.email && (
                                    <p className="text-xs text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="author-password" className={labelClassName}>
                                    Password
                                </label>

                                <input id="author-password" type="password" className={inputClassName}
                                    placeholder="Enter password"
                                    {...register("password", {
                                        required: "Password is required",
                                    })}
                                />

                                {errors.password && (
                                    <p className="text-xs text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="author-role" className={labelClassName}>
                                    Role
                                </label>

                                <select id="author-role" className={selectClassName}
                                    {...register("role")}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="sub_admin">
                                        Sub Admin
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-6 w-full col-span-2 lg:col-span-1 h-fit">
                        <div className="border-b border-white/8 pb-4">
                            <h3 className="text-lg font-semibold text-[#eef4ff]">
                                Profile Image
                            </h3>

                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                Upload profile image for the author account.
                            </p>
                        </div>

                        <div className="mt-6">
                            <button type="button" onClick={() => setOpenMediaModal(true)}
                                className="group flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 transition hover:border-[#31425e]"
                            >
                                {previewImage ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10">
                                            <Image fill alt="Preview" className="object-cover"
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
                    setPreviewImage(url);
                    setValue("profile_image", url);
                }}
            />
        </>
    );
};

export default AuthorCreatePage;