import { useRef, useState } from "react";
import { HtmlButton, useEditorState } from "react-simple-wysiwyg";
import LinkModal from "./LinkModal";
import UploadMediaModal from "../media/UploadMediaModal";
import {
    Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image, AlignLeft, AlignCenter, AlignRight, Undo, Redo,
    Type, Heading1, Heading2, Heading3, Highlighter, Palette, Eraser, DropletOff,
} from "lucide-react";

type ToolbarButtonProps = {
    title: string;
    icon: React.ReactNode;
    onAction: () => void;
};

type LinkFormValues = {
    url: string;
    text: string;
    openInNewTab: boolean;
};

type EditorPlatformData = {
    data?: Array<{ id: number }>;
} | null;
const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const ToolbarButton = ({ title, icon, onAction }: ToolbarButtonProps) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => {
            e.preventDefault();
            onAction();
        }}
        className="min-w-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
    >
        {icon}
    </button>
);


const focusEditor = (editorElement?: HTMLElement) => {
    if (!editorElement) {
        return;
    }

    if (!editorElement.contains(document.activeElement)) {
        editorElement.focus();
    }
};

const restoreRange = (range: Range | null) => {
    if (typeof window === "undefined") {
        return;
    }

    if (!range) {
        return;
    }

    const selection = window.getSelection();
    if (!selection) {
        return;
    }

    selection.removeAllRanges();
    selection.addRange(range);
};

const runEditorCommand = (
    editorElement: HTMLElement | undefined,
    command: string,
    value?: string,
    range?: Range | null,
) => {
    focusEditor(editorElement);
    restoreRange(range || null);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
};

const getCurrentRange = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    return selection.getRangeAt(0).cloneRange();
};

const ColorPickerButton = ({ title, icon, defaultColor, onPick, }: {
    title: string;
    icon: React.ReactNode;
    defaultColor: string;
    onPick: (color: string) => void;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const editorState = useEditorState();

    if (editorState.htmlMode) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                title={title}
                onMouseDown={(e) => {
                    e.preventDefault();
                    savedRangeRef.current = getCurrentRange();
                    inputRef.current?.click();
                }}
                className="min-w-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
                {icon}
            </button>
            <input
                ref={inputRef}
                type="color"
                defaultValue={defaultColor}
                className="sr-only"
                onChange={(e) => {
                    restoreRange(savedRangeRef.current);
                    onPick(e.target.value);
                }}
            />
        </>
    );
};

const RichTextToolbar = ({ platformData }: { platformData: EditorPlatformData }) => {
    const editorState = useEditorState();
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [hasLinkSelection, setHasLinkSelection] = useState(false);
    const savedRangeRef = useRef<Range | null>(null);

    if (editorState.htmlMode) {
        return (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <HtmlButton />
            </div>
        );
    }

    const editorElement = editorState.$el;

    const applyHeading = (tagName: "P" | "H1" | "H2" | "H3") => {
        runEditorCommand(editorElement, "formatBlock", tagName, savedRangeRef.current);
    };

    const handleOpenLinkModal = () => {
        savedRangeRef.current = getCurrentRange();
        setHasLinkSelection(Boolean(savedRangeRef.current?.toString().trim()));
        setIsLinkModalOpen(true);
    };

    const handleOpenImageModal = () => {
        savedRangeRef.current = getCurrentRange();
        setIsImageModalOpen(true);
    };

    const handleLinkSubmit = ({ url, text, openInNewTab }: LinkFormValues) => {
        const trimmedUrl = url.trim();
        const trimmedText = text.trim();

        if (!trimmedUrl) {
            setIsLinkModalOpen(false);
            return;
        }

        focusEditor(editorElement);
        restoreRange(savedRangeRef.current);

        const selection = window.getSelection();
        const selectedText = selection?.toString().trim() || "";

        if (selectedText) {
            document.execCommand("createLink", false, trimmedUrl);
            const anchorNode = selection?.anchorNode?.parentElement?.closest("a");
            if (anchorNode && openInNewTab) {
                anchorNode.setAttribute("target", "_blank");
                anchorNode.setAttribute("rel", "noopener noreferrer");
            } else if (anchorNode) {
                anchorNode.removeAttribute("target");
                anchorNode.removeAttribute("rel");
            }
        } else {
            const safeText = escapeHtml(trimmedText || trimmedUrl);
            const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
            const safeUrl = escapeHtml(trimmedUrl);
            document.execCommand(
                "insertHTML",
                false,
                `<a href="${safeUrl}"${targetAttr}>${safeText}</a>`,
            );
        }

        setIsLinkModalOpen(false);
    };

    const handleClearFormatting = () => {
        focusEditor(editorElement);
        restoreRange(savedRangeRef.current);
        document.execCommand("removeFormat");
        document.execCommand("unlink");
        document.execCommand("foreColor", false, "#000000");
        document.execCommand("hiliteColor", false, "transparent");
        document.execCommand("formatBlock", false, "P");
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-1.75 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <ToolbarButton
                    title="Normal"
                    icon={<Type size={15} />}
                    onAction={() => applyHeading("P")}
                />
                <ToolbarButton
                    title="Heading 1"
                    icon={<Heading1 size={15} />}
                    onAction={() => applyHeading("H1")}
                />
                <ToolbarButton
                    title="Heading 2"
                    icon={<Heading2 size={15} />}
                    onAction={() => applyHeading("H2")}
                />
                <ToolbarButton
                    title="Heading 3"
                    icon={<Heading3 size={15} />}
                    onAction={() => applyHeading("H3")}
                />

                <ToolbarButton
                    title="Bold"
                    icon={<Bold size={15} />}
                    onAction={() => runEditorCommand(editorElement, "bold", undefined, savedRangeRef.current)}
                />
                <ToolbarButton
                    title="Italic"
                    icon={<Italic size={15} />}
                    onAction={() => runEditorCommand(editorElement, "italic", undefined, savedRangeRef.current)}
                />
                <ToolbarButton
                    title="Underline"
                    icon={<Underline size={15} />}
                    onAction={() => runEditorCommand(editorElement, "underline", undefined, savedRangeRef.current)}
                />

                <ToolbarButton
                    title="Bullet List"
                    icon={<List size={15} />}
                    onAction={() =>
                        runEditorCommand(editorElement, "insertUnorderedList", undefined, savedRangeRef.current)
                    }
                />
                <ToolbarButton
                    title="Numbered List"
                    icon={<ListOrdered size={15} />}
                    onAction={() =>
                        runEditorCommand(editorElement, "insertOrderedList", undefined, savedRangeRef.current)
                    }
                />
                <ToolbarButton title="Link" icon={<LinkIcon size={15} />} onAction={handleOpenLinkModal} />

                <ColorPickerButton
                    title="Text Color"
                    icon={<Palette size={15} />}
                    defaultColor="#000000"
                    onPick={(color) =>
                        runEditorCommand(editorElement, "foreColor", color, savedRangeRef.current)
                    }
                />
                <ToolbarButton
                    title="Remove Color"
                    icon={<Eraser size={15} />}
                    onAction={() => {
                        runEditorCommand(editorElement, "foreColor", "#000000", savedRangeRef.current);
                        runEditorCommand(editorElement, "hiliteColor", "transparent", savedRangeRef.current);
                    }}
                />
                <ToolbarButton
                    title="Clear Format"
                    icon={<DropletOff size={15} />}
                    onAction={handleClearFormatting}
                />
                <ColorPickerButton
                    title="Highlight"
                    icon={<Highlighter size={15} />}
                    defaultColor="#fff59d"
                    onPick={(color) =>
                        runEditorCommand(editorElement, "hiliteColor", color, savedRangeRef.current)
                    }
                />

                <ToolbarButton
                    title="Image"
                    icon={<Image size={15} />}
                    onAction={handleOpenImageModal}
                />

                <ToolbarButton
                    title="Align Left"
                    icon={<AlignLeft size={15} />}
                    onAction={() => runEditorCommand(editorElement, "justifyLeft", undefined, savedRangeRef.current)}
                />
                <ToolbarButton
                    title="Align Center"
                    icon={<AlignCenter size={15} />}
                    onAction={() =>
                        runEditorCommand(editorElement, "justifyCenter", undefined, savedRangeRef.current)
                    }
                />
                <ToolbarButton
                    title="Align Right"
                    icon={<AlignRight size={15} />}
                    onAction={() => runEditorCommand(editorElement, "justifyRight", undefined, savedRangeRef.current)}
                />

                <ToolbarButton
                    title="Undo"
                    icon={<Undo size={15} />}
                    onAction={() => runEditorCommand(editorElement, "undo")}
                />
                <ToolbarButton
                    title="Redo"
                    icon={<Redo size={15} />}
                    onAction={() => runEditorCommand(editorElement, "redo")}
                />

                <HtmlButton />
            </div>

            <LinkModal
                isOpen={isLinkModalOpen}
                onClose={() => {
                    setIsLinkModalOpen(false);
                    setHasLinkSelection(false);
                }}
                onSubmit={handleLinkSubmit}
                hasSelection={hasLinkSelection}
            />
            {isImageModalOpen &&
                <UploadMediaModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    platformData={platformData}
                    onSelectImage={(url) => {
                        const normalizedUrl =
                            url.startsWith("http://") || url.startsWith("https://")
                                ? url
                                : `${process.env.BACKEND_DOMAIN}/${url}`;

                        runEditorCommand(
                            editorElement,
                            "insertImage",
                            normalizedUrl,
                            savedRangeRef.current,
                        );
                        setIsImageModalOpen(false);
                    }}
                />
            }
        </>
    );
};

export default RichTextToolbar;