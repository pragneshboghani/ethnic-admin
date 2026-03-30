"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Platform } from "@/types";
import PlateformActions from "@/actions/PlateFormActions";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    editingPlatform?: Platform | null;
    refreshPlatforms: () => void;
}

const AddEditPlatformModal = ({
    open,
    onClose,
    editingPlatform,
    refreshPlatforms,
}: Props) => {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control
    } = useForm<Platform>({
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
            CTA_button_text: ""
        },
    });

    const authType = watch("auth_type");
    const dataSource = watch("data_source");

    useEffect(() => {
        if (editingPlatform) {
            reset({
                ...editingPlatform
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
                CTA_button_text: ""
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
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="w-[900px] rounded-xl p-6 glass-card max-h-[90vh] overflow-y-auto">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            {editingPlatform ? "Update Platform" : "Add New Platform"}
                        </h2>

                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

                        <div className="flex gap-4">
                            <div className="space-y-2 w-full">
                                <label className="text-sm font-semibold">Platform Name</label>
                                <input
                                    type="text"
                                    {...register("platform_name", { required: true })}
                                    placeholder="Platform Name"
                                    className="w-full p-2 rounded bg-white border text-black"
                                />
                            </div>

                            <div className="space-y-2 w-full">
                                <label className="text-sm font-semibold">Website URL</label>
                                <input
                                    type="text"
                                    {...register("website_url")}
                                    placeholder="Website URL"
                                    className="w-full p-2 rounded bg-white border text-black"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 w-full">
                            <label className="text-sm font-semibold">Default API Endpoint</label>
                            <input
                                type="text"
                                {...register("blog_path")}
                                placeholder="Default Blog Path"
                                className="w-full p-2 rounded bg-white border text-black"
                            />
                        </div>

                        <div className="flex gap-4">

                            <div className="space-y-2 w-full">
                                <label className="text-sm font-semibold">Default CTA Link</label>
                                <input
                                    type="text"
                                    {...register("CTA_link")}
                                    placeholder="Default CTA Link"
                                    className="w-full p-2 rounded bg-white border text-black"
                                />
                            </div>

                            <div className="space-y-2 w-full">
                                <label className="text-sm font-semibold">Default CTA Button Text</label>
                                <input
                                    type="text"
                                    {...register("CTA_button_text")}
                                    placeholder="Default Button text for CTA"
                                    className="w-full p-2 rounded bg-white border text-black"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 w-full">
                            <label className="text-white font-medium">Data Source</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1 text-white">
                                    <input
                                        type="radio"
                                        value="platform"
                                        {...register("data_source")}
                                    />
                                    Platform
                                </label>
                                <label className="flex items-center gap-1 text-white">
                                    <input
                                        type="radio"
                                        value="admin"
                                        {...register("data_source")}
                                    />
                                    Admin
                                </label>
                            </div>
                        </div>

                        {dataSource === "platform" && (
                            <>
                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-semibold">API Endpoint</label>
                                    <input
                                        type="text"
                                        {...register("api_endpoint")}
                                        placeholder="API Endpoint"
                                        className="w-full p-2 rounded bg-white border text-black"
                                    />
                                </div>

                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-semibold">Platform Type</label>
                                    <select
                                        {...register("plateform_type")}
                                        className="w-full p-2 rounded bg-white border text-black"
                                    >
                                        <option value="custom">Custom</option>
                                        <option value="wordpress">Wordpress</option>
                                    </select>
                                </div>

                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-semibold">Authentication Type</label>
                                    <select
                                        {...register("auth_type")}
                                        className="w-full p-2 rounded bg-white border text-black"
                                    >
                                        <option value="none">No Auth</option>
                                        <option value="token">Token Based</option>
                                        <option value="basic">Basic Auth (Username & Password)</option>
                                    </select>
                                </div>

                                {authType === "token" && (
                                    <div className="space-y-2 w-full">
                                        <label className="text-sm font-semibold">Auth Token</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Token"
                                            {...register("auth_token")}
                                            className="w-full p-2 rounded bg-white text-black"
                                        />
                                    </div>
                                )}
                                {authType === "basic" && (
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-full">
                                            <label className="text-sm font-semibold">Username</label>
                                            <input
                                                type="text"
                                                placeholder="Username"
                                                {...register("username")}
                                                className="w-full p-2 rounded bg-white text-black"
                                            />
                                        </div>

                                        <div className="space-y-2 w-full">
                                            <label className="text-sm font-semibold">Password</label>
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                {...register("password")}
                                                className="w-full p-2 rounded bg-white text-black"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-2 w-full">
                            <label className="text-sm font-semibold">Status</label>
                            <select
                                {...register("status")}
                                className="w-full p-2 rounded bg-white border text-black"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 rounded text-white"
                            >
                                {editingPlatform ? "Update" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddEditPlatformModal;