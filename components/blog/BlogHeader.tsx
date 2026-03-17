'use client';

import { Save, Send, Eye } from 'lucide-react';

const BlogHeader = ({
    onPreview,
    onSaveDraft,
}: {
    onPreview: () => void;
    onSaveDraft: () => void;
}) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 glass-card">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Blog</h1>
            <p className="text-slate-500 mt-1">Draft a new blog and choose where to publish.</p>
        </div>
        <div className="flex items-center gap-3">
            <button type="button" onClick={onPreview} className="btn">
                <Eye size={18} />
                Preview
            </button>
            <button type="button" className="btn" onClick={onSaveDraft}>
                <Save size={18} />
                Save Draft
            </button>
            <button type="submit" className="btn">
                <Send size={18} />
                Publish All
            </button>
        </div>
    </div>
);

export default BlogHeader