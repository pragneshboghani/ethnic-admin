"use client";

import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const Plateforms = () => {

    const [platformData, setPlatformData] = useState<{ data: Platform[] } | null>(null);
    const [deletePlatformId, setDeletePlatformId] = useState<number | null>(null);
    const [editingPlatformId, setEditingPlatformId] = useState<number | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState<Platform>({
        platform_name: "",
        website_url: "",
        api_endpoint: "",
        auth_token: "",
        status: "Active",
    });

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
            if (editingPlatformId) {
                await PlateformActions.UpdatePlateForm(editingPlatformId, formData);
                toast.success(`Your Platform "${formData.platform_name}" successfully updated! 🎉`);
            } else {
                await PlateformActions.AddPlateformData(formData);
                toast.success(`Your Platform "${formData.platform_name}" successfully added! 🚀`);
            }

            setOpenModal(false);
            setEditingPlatformId(null);
            setFormData({
                platform_name: "",
                website_url: "",
                api_endpoint: "",
                auth_token: "",
                status: "Active",
            });

            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res.data);

        } catch (error) {
            toast.error(`Platform save failed 😢: ${(error as Error).message}`);
        }
    };

    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res.data);
        };
        fetchPlatforms();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await PlateformActions.DeletePlateForm(id);

            toast.success("Platform successfully deleted! 🗑️");
            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res.data);

        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete platform 😢");
        }
    };

    return (
        <>
            <div className="grid grid-cols-3 gap-6">

                {platformData?.data?.map((platform: Platform) => (
                    <div
                        key={platform.id}
                        className="border border-gray-700 rounded-xl p-6 cursor-pointer"
                    >
                        <div className="w-full flex justify-between items-center mb-3">
                            <h3 className="text-white text-lg font-semibold">
                                {platform.platform_name}
                            </h3>
                            <div className="flex gap-3">
                                <button
                                    className="text-white hover:text-blue-500"
                                    title="Edit Platform"
                                    onClick={() => {
                                        setFormData(platform);
                                        setEditingPlatformId(platform.id!);
                                        setOpenModal(true);
                                    }}
                                >
                                    <Pencil size={18} />
                                </button>

                                <button
                                    className="text-white hover:text-red-500"
                                    title="Delete Platform"
                                    onClick={() => setDeletePlatformId(platform.id!)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-2">
                            Website URL :  {platform.website_url}
                        </p>

                        <p className="text-gray-400 text-sm mb-2">
                            API Endpoint : {platform.api_endpoint}
                        </p>

                        <p className="text-xs flex gap-2 items-center">
                            Status:
                            <span
                                className={` px-2 py-1 rounded
                ${platform.status === "Active"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                            >
                                {platform.status}
                            </span>
                        </p>
                    </div>
                ))}

                <div
                    onClick={() => setOpenModal(true)}
                    className="border border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer">
                    <div className="text-3xl mb-2">+</div>
                    <p className="text-gray-400">Add New Platform</p>
                </div>

            </div>
            {openModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="w-[500px] rounded-xl p-6 glass-card">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white">
                                {editingPlatformId ? "Update Platform" : "Add New Platform"}
                            </h2>

                            <button
                                onClick={() => {
                                    setOpenModal(false);
                                    setEditingPlatformId(null);
                                    setFormData({
                                        platform_name: "",
                                        website_url: "",
                                        api_endpoint: "",
                                        auth_token: "",
                                        status: "Active",
                                    });
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="text-sm text-gray-300">
                                    Platform Name
                                </label>
                                <input
                                    type="text"
                                    name="platform_name"
                                    value={formData.platform_name}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 rounded bg-white border border-gray-700 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">
                                    Website URL
                                </label>
                                <input
                                    type="text"
                                    name="website_url"
                                    value={formData.website_url}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 rounded bg-white border border-gray-700 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">
                                    API Endpoint
                                </label>
                                <input
                                    type="text"
                                    name="api_endpoint"
                                    value={formData.api_endpoint}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 rounded bg-white border border-gray-700 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">
                                    Auth Token
                                </label>
                                <input
                                    type="text"
                                    name="auth_token"
                                    value={formData.auth_token}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 rounded bg-white border border-gray-700 focus:outline-none text-sm text-black"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 rounded bg-white border border-gray-700 focus:outline-none text-sm text-black">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="px-4 py-2 rounded border border-gray-600 text-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {editingPlatformId ? "Update" : "Save Platform"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}
            {deletePlatformId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="rounded-xl p-6 w-[400px] text-center glass-card">
                        <h3 className="text-white text-lg font-semibold mb-4">
                            Are you sure you want to delete this platform?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setDeletePlatformId(null)}
                                className="px-4 py-2 rounded-lg btn btn-primary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deletePlatformId) {
                                        handleDelete(deletePlatformId);
                                        setDeletePlatformId(null);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg transition btn btn-secondary"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Plateforms;