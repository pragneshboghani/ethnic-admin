

function ToolbarButton({ children, onClick, active }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
        >
            {children}
        </button>
    );
}

function EditorToolbar({ editor }: { editor: any }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
            >
                <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
            >
                <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
            >
                H2
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
            >
                List
            </ToolbarButton>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <ToolbarButton
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                active={editor.isActive('link')}
            >
                Link
            </ToolbarButton>
        </div>
    );
}

export default EditorToolbar