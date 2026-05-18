"use client";

import { useEffect, useState } from "react";
import GroupForm from "@/components/group/GroupForm";
import GroupActions from "@/actions/GroupActions";
import { useParams } from "next/navigation";

const GroupUpdatePage = () => {
    const params = useParams();
    const id = Number(params.id);

    const [initialData, setInitialData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
          setError("Invalid group ID");
          return;
        }

        const loadGroup = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await GroupActions.getGroupById(id);
                const data = response?.data || response;

                setInitialData({
                    id: data?.id,
                    name: data?.name || "",
                    description: data?.description || "",
                    image: data?.image || "",
                    created_by: data?.created_by,
                    members:
                        typeof data?.members === "string"
                            ? JSON.parse(data.members || "[]")
                            : data?.members || [],
                });
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Failed to load group details.");
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [id]);

    if (loading) {
        return <div>Loading group details...</div>;
    }

    if (error) {
        return (
            <div className="rounded-[24px] border border-white/8 bg-[#151d2c] p-6 text-white">
                <h2 className="text-xl font-semibold">Unable to load group</h2>
                <p className="mt-2 text-sm text-[#8ea0b8]">{error}</p>
            </div>
        );
    }

    if (!initialData) {
        return <div>Loading group details...</div>;
    }

    return <GroupForm mode="update" initialData={initialData} />;
};

export default GroupUpdatePage;
