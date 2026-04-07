"use client";

import DashBoardActions from '@/actions/DashboardAction';
import AddEditPlatformModal from '@/components/plateform/AddEditPlatformModal'
import React, { useEffect, useState } from 'react'
import { ActivePlatform } from '../../dashboard/page';
import { useRouter } from 'next/navigation';

const page = () => {
    const router = useRouter();

    const [openModal, setOpenModal] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState(null);
    const [activePlateform, setactivePlateform] = useState<ActivePlatform[]>([]);

    const fetchActivePlatform = async () => {
        const res = await DashBoardActions.getActivePlatform();
        setactivePlateform(res.data);
    };

    useEffect(() => {
        setOpenModal(true)
    }, [])

    const handleClose = () => {
        setOpenModal(false);
        router.back();
    };
    return (
        <>
            <div>
                <AddEditPlatformModal
                    open={openModal}
                    onClose={handleClose}
                    refreshPlatforms={fetchActivePlatform}
                />
            </div>
        </>
    )
}

export default page