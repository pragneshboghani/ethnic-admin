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
                <div className="w-[500px] rounded-xl p-6 glass-card">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            {editingPlatform ? "Update Platform" : "Add New Platform"}
                        </h2>

                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

                        <input
                            type="text"
                            {...register("platform_name", { required: true })}
                            placeholder="Platform Name"
                            className="w-full p-2 rounded bg-white border text-black"
                        />

                        <input
                            type="text"
                            {...register("website_url")}
                            placeholder="Website URL"
                            className="w-full p-2 rounded bg-white border text-black"
                        />

                        <div className="space-y-2">
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
                                <input
                                    type="text"
                                    {...register("api_endpoint")}
                                    placeholder="API Endpoint"
                                    className="w-full p-2 rounded bg-white border text-black"
                                />

                                <select
                                    {...register("plateform_type")}
                                    className="w-full p-2 rounded bg-white border text-black"
                                >
                                    <option value="custom">Custom</option>
                                    <option value="wordpress">Wordpress</option>
                                </select>
                                <select
                                    {...register("auth_type")}
                                    className="w-full p-2 rounded bg-white border text-black"
                                >
                                    <option value="none">No Auth</option>
                                    <option value="token">Token Based</option>
                                    <option value="basic">Basic Auth (Username & Password)</option>
                                </select>

                                {authType === "token" && (
                                    <input
                                        type="text"
                                        placeholder="Enter Token"
                                        {...register("auth_token")}
                                        className="w-full p-2 rounded bg-white text-black"
                                    />
                                )}
                                {authType === "basic" && (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            {...register("username")}
                                            className="w-full p-2 rounded bg-white text-black"
                                        />

                                        <input
                                            type="password"
                                            placeholder="Password"
                                            {...register("password")}
                                            className="w-full p-2 rounded bg-white text-black"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <select
                            {...register("status")}
                            className="w-full p-2 rounded bg-white border text-black"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

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