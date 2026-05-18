"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GroupForm from "@/components/group/GroupForm";
import GroupActions from "@/actions/GroupActions";

const GroupAddUpdatePage = () => {
    const params = useParams();
    const idParam = Number(params.id);
    const [initialData, setInitialData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const id = idParam || null;
        if (!id) return;

        const load = async () => {
            setLoading(true);
            try {
                const res = await GroupActions.getGroupById(id);
                const data = res?.data || res;
                setInitialData({
                    id: data?.id,
                    name: data?.name || "",
                    description: data?.description || "",
                    image: data?.image || "",
                    created_by: data?.created_by,
                    members: data?.members || [],
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [idParam]);

    if (idParam && loading) {
        return <div>Loading group...</div>;
    }

    const mode = idParam ? "update" : "create";

    return <GroupForm mode={mode as "create" | "update"} initialData={initialData} />;
};

export default GroupAddUpdatePage;
