"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform } from "@/types";
import PlateformActions from "@/actions/PlateFormActions";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    editingPlatform?: Platform | null;
    refreshPlatforms: () => void;
}

const AddEditPlatformModal = ({ open, onClose, editingPlatform, refreshPlatforms, }: Props) => {
    const inputClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";
    const selectClassName =
        "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] transition focus:border-[#31425e] focus:outline-none";
    const labelClassName =
        "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

    const { register, handleSubmit, watch, reset, control, setValue } = useForm<Platform>({
        defaultValues: {
            platform_name: "",
            website_url: "",
            api_endpoint: "",
            plateform_type: "custom",
            auth_type: "none",
            auth_token: "",
            username: "",
            password: "",
            status: "Active",
            data_source: "platform",
            blog_path: "",
            CTA_link: "",
            CTA_button_text: "",
        },
    });

    const authType = watch("auth_type");
    const dataSource = watch("data_source");

    useEffect(() => {
        if (editingPlatform) {
            reset({
                ...editingPlatform,
            });
        } else {
            reset({
                platform_name: "",
                website_url: "",
                api_endpoint: "",
                plateform_type: "custom",
                auth_type: "none",
                auth_token: "",
                username: "",
                password: "",
                status: "Active",
                data_source: "platform",
                blog_path: "",
                CTA_link: "",
                CTA_button_text: "",
            });
        }
    }, [editingPlatform, reset]);

    const onSubmit = async (data: Platform) => {
        try {
            if (editingPlatform?.id) {
                await PlateformActions.updatePlateForm(editingPlatform.id, data);
                toast.success("Platform updated successfully 🎉");
            } else {
                await PlateformActions.addPlateformData(data);
                toast.success("Platform added successfully 🚀");
            }

            refreshPlatforms();
            onClose();
        } catch (error) {
            toast.error("Failed to save platform 😢");
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
                <div className="relative max-h-[88vh] w-full max-w-[980px] overflow-y-auto rounded-[28px] border border-white/10 bg-[#101826] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#151d2c] text-[#dbe5f3] transition hover:border-[#31425e] hover:bg-[#182438]"
                    >
                        <X size={18} />
                    </button>

                    <div className="pr-12">
                        <p className={labelClassName}>Platform Manager</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#eef4ff]">
                            {editingPlatform ? "Update Platform" : "Add New Platform"}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#8ea0b8]">
                            Configure destination details, publishing defaults, and connection settings in one place.
                        </p>
                    </div>

                    <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                            <div className="border-b border-white/8 pb-4">
                                <h3 className="text-lg font-semibold text-[#eef4ff]">Basic Details</h3>
                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Set the main platform information used across the dashboard.
                                </p>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="platform-name" className={labelClassName}>Platform Name</label>
                                    <input
                                        id="platform-name"
                                        type="text"
                                        {...register("platform_name", { required: true })}
                                        placeholder="Platform Name"
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="platform-website-url" className={labelClassName}>Website URL</label>
                                    <input
                                        id="platform-website-url"
                                        type="text"
                                        {...register("website_url")}
                                        placeholder="Website URL"
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="platform-blog-path" className={labelClassName}>Default Blog Path</label>
                                    <input
                                        id="platform-blog-path"
                                        type="text"
                                        {...register("blog_path")}
                                        placeholder="Default Blog Path"
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="platform-cta-link" className={labelClassName}>Default CTA Link</label>
                                    <input
                                        id="platform-cta-link"
                                        type="text"
                                        {...register("CTA_link")}
                                        placeholder="Default CTA Link"
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="platform-cta-button-text" className={labelClassName}>Default CTA Button Text</label>
                                    <input
                                        id="platform-cta-button-text"
                                        type="text"
                                        {...register("CTA_button_text")}
                                        placeholder="Default button text for CTA"
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-5">
                            <div className="border-b border-white/8 pb-4">
                                <h3 className="text-lg font-semibold text-[#eef4ff]">Connection Settings</h3>
                                <p className="mt-1 text-sm text-[#8ea0b8]">
                                    Choose where the content comes from and how this platform should authenticate.
                                </p>
                            </div>

                            <div className="mt-5 space-y-5">
                                <div className="space-y-2">
                                    <p className={labelClassName}>Data Source</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label
                                            className={`cursor-pointer rounded-[18px] border px-4 py-3 transition ${dataSource === "platform"
                                                ? "border-[#31425e] bg-[#101826] shadow-[inset_0_0_0_1px_rgba(142,160,184,0.12)]"
                                                : "border-white/8 bg-[#101826] hover:border-white/15"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value="platform"
                                                {...register("data_source")}
                                                className="sr-only"
                                            />
                                            <span className="block text-sm font-semibold text-[#eef4ff]">Platform</span>
                                            <span className="mt-1 block text-xs leading-6 text-[#8ea0b8]">
                                                Publish through a connected API endpoint.
                                            </span>
                                        </label>

                                        <label
                                            className={`cursor-pointer rounded-[18px] border px-4 py-3 transition ${dataSource === "admin"
                                                ? "border-[#31425e] bg-[#101826] shadow-[inset_0_0_0_1px_rgba(142,160,184,0.12)]"
                                                : "border-white/8 bg-[#101826] hover:border-white/15"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value="admin"
                                                {...register("data_source")}
                                                className="sr-only"
                                            />
                                            <span className="block text-sm font-semibold text-[#eef4ff]">Admin</span>
                                            <span className="mt-1 block text-xs leading-6 text-[#8ea0b8]">
                                                Manage content internally without a remote endpoint.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {dataSource === "platform" && (
                                    <div className="rounded-[20px] border border-white/8 bg-[#101826] p-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <label htmlFor="platform-api-endpoint" className={labelClassName}>API Endpoint</label>
                                                <input
                                                    id="platform-api-endpoint"
                                                    type="text"
                                                    {...register("api_endpoint")}
                                                    placeholder="API Endpoint"
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="platform-type" className={labelClassName}>Platform Type</label>
                                                <select
                                                    id="platform-type"
                                                    {...register("plateform_type")}
                                                    className={selectClassName}
                                                >
                                                    <option value="custom">Custom</option>
                                                    <option value="wordpress">Wordpress</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="platform-auth-type" className={labelClassName}>Authentication Type</label>
                                                <select
                                                    id="platform-auth-type"
                                                    {...register("auth_type")}
                                                    className={selectClassName}
                                                >
                                                    <option value="none">No Auth</option>
                                                    <option value="token">Token Based</option>
                                                    <option value="basic">Basic Auth (Username & Password)</option>
                                                </select>
                                            </div>

                                            {authType === "token" && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label htmlFor="platform-auth-token" className={labelClassName}>Auth Token</label>
                                                    <input
                                                        id="platform-auth-token"
                                                        type="text"
                                                        placeholder="Enter token"
                                                        {...register("auth_token")}
                                                        className={inputClassName}
                                                    />
                                                </div>
                                            )}

                                            {authType === "basic" && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label htmlFor="platform-username" className={labelClassName}>Username</label>
                                                        <input
                                                            id="platform-username"
                                                            type="text"
                                                            placeholder="Username"
                                                            {...register("username")}
                                                            className={inputClassName}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label htmlFor="platform-password" className={labelClassName}>Password</label>
                                                        <input
                                                            id="platform-password"
                                                            type="password"
                                                            placeholder="Password"
                                                            {...register("password")}
                                                            className={inputClassName}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="platform-status" className={labelClassName}>Status</label>
                                    <select
                                        id="platform-status"
                                        {...register("status")}
                                        className={selectClassName}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-[#b8c4d4] transition hover:bg-white/[0.04]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                            >
                                {editingPlatform ? "Update Platform" : "Save Platform"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddEditPlatformModal;
