"use client";

import { useState, useEffect } from "react";
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

    const [formData, setFormData] = useState<Platform>({
        platform_name: "",
        website_url: "",
        api_endpoint: "",
        auth_type: "none",
        auth_token: "",
        username: "",
        password: "",
        status: "Active",
    });

    useEffect(() => {
        if (editingPlatform) {
            setFormData(editingPlatform);
        } else {
            setFormData({
                platform_name: "",
                website_url: "",
                api_endpoint: "",
                auth_type: "none",
                auth_token: "",
                username: "",
                password: "",
                status: "Active",
            });
        }
    }, [editingPlatform]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPlatform?.id) {
                await PlateformActions.UpdatePlateForm(editingPlatform.id, formData);
                toast.success(`Platform updated successfully 🎉`);
            } else {
                await PlateformActions.AddPlateformData(formData);
                toast.success(`Platform added successfully 🚀`);
            }

            refreshPlatforms();
            onClose();

        } catch (error) {
            toast.error("Failed to save platform 😢");
        }
    };

    const handleAuthChange = (e: any) => {
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            auth_type: value,
            auth_token: "",
            username: "",
            password: "",
        }));
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

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        <input
                            type="text"
                            name="platform_name"
                            value={formData.platform_name}
                            onChange={handleChange}
                            placeholder="Platform Name"
                            className="w-full p-2 rounded bg-white border text-black"
                        />

                        <input
                            type="text"
                            name="website_url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="Website URL"
                            className="w-full p-2 rounded bg-white border text-black"
                        />

                        <input
                            type="text"
                            name="api_endpoint"
                            value={formData.api_endpoint}
                            onChange={handleChange}
                            placeholder="API Endpoint"
                            className="w-full p-2 rounded bg-white border text-black"
                        />
                        <select
                            name="auth_type"
                            value={formData.auth_type}
                            onChange={handleAuthChange}
                            className="w-full p-2 rounded bg-white border text-black"
                        >
                            <option value="none">No Auth</option>
                            <option value="token">Token Based</option>
                            <option value="basic">Basic Auth (Username & Password)</option>
                        </select>

                        {formData.auth_type === "token" && (
                            <input
                                type="text"
                                placeholder="Enter Token"
                                value={formData.auth_token}
                                onChange={(e) =>
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        auth_token: e.target.value,
                                    }))
                                }
                                className="w-full p-2 rounded bg-white text-black"
                            />
                        )}
                        {formData.auth_type === "basic" && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            username: e.target.value,
                                        }))
                                    }
                                    className="w-full p-2 rounded bg-white text-black"
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    className="w-full p-2 rounded bg-white text-black"
                                />
                            </div>
                        )}

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
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