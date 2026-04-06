'use client';

import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { PlatformResponse } from '../common/CategoryModal';

export type Category = {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    created_at?: string;
    platform_ids?: number[];
    status?: string;
}
type ViewDetailsModalProps = {
    showData: {
        data: Category | null;
        type: string;
    };
    setShowdata: Dispatch<SetStateAction<{
        data: Category | null;
        type: string;
    }>>;
    platformData: PlatformResponse | null;
    handleEdit: () => void;
    handleDeleteCategory: (category: Category, type: string) => void;
};

const ViewDetailsModal = ({ showData, setShowdata, platformData, handleEdit, handleDeleteCategory }: ViewDetailsModalProps) => {

    if (!showData.data) return null; 
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="p-6 w-[400px] glass-card space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{showData.type === 'category' ? 'Category Details' : 'Tag Details'}</h2>
                    <button className="text-white" onClick={() => setShowdata({ data: null, type: '' })}>
                        <X />
                    </button>
                </div>
                <p><strong>Name:</strong> {showData.data.name}</p>
                <p><strong>Description:</strong> {showData.data.description || '-'}</p>
                <p><strong>Platform:</strong>
                    {showData.data.platform_ids?.map((platform: any) => {
                        const platformInfo = platformData?.data?.find(p => p.id === platform);
                        return platformInfo ? (
                            <span key={platform} className="text-white px-2 py-1 rounded-full text-md mr-1">
                                {platformInfo.platform_name}
                            </span>
                        ) : null;
                    })}</p>
                <p><strong>Slug:</strong> {showData.data.slug}
                </p>
                <p>
                    <strong>Created At:</strong>{' '}
                    {showData.data.created_at
                        ? new Date(showData.data.created_at).toLocaleString()
                        : '-'}
                </p>
                <div className='flex align-self-end justify-end gap-4'>
                    <button className='btn' onClick={handleEdit}>
                        Update
                    </button>
                    <button className="btn" onClick={() => { handleDeleteCategory(showData.data as Category, showData.type === 'category' ? 'category' : 'tags') }}>
                        Delete {showData.type === 'category' ? 'Category' : 'Tag'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewDetailsModal;