import {
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo
} from "lucide-react";

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

function EditorToolbar({ editor }: any) {
    if (!editor) return null;
    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            <ToolbarButton
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
            >
                <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
            >
                <span className="italic">I</span>
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Heading 1"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
            >
                H1
            </ToolbarButton>
            <ToolbarButton
                title="Heading 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
            >
                H2
            </ToolbarButton>
            <ToolbarButton
                title="Heading 3"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
            >
                H3
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Bullet List"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
            >
                UL
            </ToolbarButton>
            <ToolbarButton
                title="Numbered List"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
            >
                OL
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Add Link"
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                active={editor.isActive('link')}
            >
                Link
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Highlight"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive('highlight')}
            >
                <Highlighter size={16} />
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Align Left"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                active={editor.isActive({ textAlign: 'left' })}
            >
                <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Align Center"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                active={editor.isActive({ textAlign: 'center' })}
            >
                <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Align Right"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                active={editor.isActive({ textAlign: 'right' })}
            >
                <AlignRight size={16} />
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
                title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo size={16} />
            </ToolbarButton>
        </div>
    );
}

export default EditorToolbar;