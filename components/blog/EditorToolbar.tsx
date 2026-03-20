import { Highlighter, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Image as ImageIcon } from "lucide-react";

type ToolbarItem = | {
    type: 'button'; title: string; action: (editor: any) => void; active?: (editor: any) => boolean;
    label: React.ReactNode;
} | { type: 'divider'; };



function ToolbarButton({ children, onClick, active, title }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors 
            ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
        >
            {children}
        </button>
    );
}

const getToolbarItems = (onAddImage: () => void): ToolbarItem[] => [
    { type: 'button', title: 'Bold', action: (e: any) => e.chain().focus().toggleBold().run(), active: (e: any) => e.isActive('bold'), label: <span className="font-bold">B</span> },
    { type: 'button', title: 'Italic', action: (e: any) => e.chain().focus().toggleItalic().run(), active: (e: any) => e.isActive('italic'), label: <span className="italic">I</span> },
    { type: 'button', title: 'Underline', action: (e: any) => e.chain().focus().toggleUnderline().run(), active: (e: any) => e.isActive('underline'), label: <span className="underline">U</span> },
    { type: 'divider' },
    { type: 'button', title: 'Heading 1', action: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: any) => e.isActive('heading', { level: 1 }), label: 'H1' },
    { type: 'button', title: 'Heading 2', action: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: any) => e.isActive('heading', { level: 2 }), label: 'H2' },
    { type: 'button', title: 'Heading 3', action: (e: any) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e: any) => e.isActive('heading', { level: 3 }), label: 'H3' },
    { type: 'divider' },
    { type: 'button', title: 'Bullet List', action: (e: any) => e.chain().focus().toggleBulletList().run(), active: (e: any) => e.isActive('bulletList'), label: 'UL' },
    { type: 'button', title: 'Numbered List', action: (e: any) => e.chain().focus().toggleOrderedList().run(), active: (e: any) => e.isActive('orderedList'), label: 'OL' },
    { type: 'divider' },
    {
        type: 'button', title: 'Add Link', active: (e: any) => e.isActive('link'), label: 'Link',
        action: (e: any) => {
            const url = window.prompt('Enter URL');
            if (url) e.chain().focus().setLink({ href: url }).run();
        },
    },
    { type: 'divider' },
    { type: 'button', title: 'Highlight', action: (e: any) => e.chain().focus().toggleHighlight().run(), active: (e: any) => e.isActive('highlight'), label: <Highlighter size={16} /> },
    {
        type: 'button',
        title: 'Add Image',
        label: <ImageIcon size={16} />,
        action: () => {
            onAddImage();
        },
    },
    { type: 'divider' },
    { type: 'button', title: 'Align Left', action: (e: any) => e.chain().focus().setTextAlign('left').run(), active: (e: any) => e.isActive({ textAlign: 'left' }), label: <AlignLeft size={16} /> },
    { type: 'button', title: 'Align Center', action: (e: any) => e.chain().focus().setTextAlign('center').run(), active: (e: any) => e.isActive({ textAlign: 'center' }), label: <AlignCenter size={16} /> },
    { type: 'button', title: 'Align Right', action: (e: any) => e.chain().focus().setTextAlign('right').run(), active: (e: any) => e.isActive({ textAlign: 'right' }), label: <AlignRight size={16} /> },
    { type: 'divider' },
    { type: 'button', title: 'Undo', action: (e: any) => e.chain().focus().undo().run(), label: <Undo size={16} /> },
    { type: 'button', title: 'Redo', action: (e: any) => e.chain().focus().redo().run(), label: <Redo size={16} /> },
];

function EditorToolbar({ editor, onAddImage }: any) {
    if (!editor) return null;

    const toolbarItems = getToolbarItems(onAddImage);

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            {toolbarItems.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={index} className="w-px h-4 bg-slate-300 mx-1" />;
                }

                return (
                    <ToolbarButton
                        key={index}
                        title={item.title}
                        onClick={() => item.action(editor)}
                        active={item.active ? item.active(editor) : false}
                    >
                        {item.label}
                    </ToolbarButton>
                );
            })}
        </div>
    );
}

export default EditorToolbar;