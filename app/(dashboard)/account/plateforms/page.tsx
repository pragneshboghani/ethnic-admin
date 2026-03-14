"use client";

import PlateformActions from "@/actions/PlateFormActions";
import { Platform } from "@/types";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AddEditPlatformModal from "@/components/plateform/AddEditPlatformModal";

const Plateforms = () => {

    const [platformData, setPlatformData] = useState<{ data: Platform[] } | null>(null);
    const [deletePlatformId, setDeletePlatformId] = useState<number | null>(null);
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const fetchPlatforms = async () => {
        const res = await PlateformActions.GetAllPlateform();
        setPlatformData(res.data);
    };

    useEffect(() => {
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
                                        setEditingPlatform(platform);
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
                    onClick={() => {
                        setEditingPlatform(null);
                        setOpenModal(true);
                    }}
                    className="border border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer">
                    <div className="text-3xl mb-2">+</div>
                    <p className="text-gray-400">Add New Platform</p>
                </div>

            </div>
            {openModal && <AddEditPlatformModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                editingPlatform={editingPlatform}
                refreshPlatforms={fetchPlatforms}
            />}
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