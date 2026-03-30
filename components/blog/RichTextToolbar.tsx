import { useEffect, useRef, useState } from "react";
import { HtmlButton, useEditorState } from "react-simple-wysiwyg";
import LinkModal from "./LinkModal";
import TableModal from "./TableModal";
import UploadMediaModal from "../media/UploadMediaModal";
import {
    Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Undo, Redo,
    Type, Heading1, Heading2, Heading3, Highlighter, Palette, Eraser, DropletOff,
    ListIndentIncrease, ListIndentDecrease,
    Table, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Trash2,
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
    data?: Array<{
        id: number;
        platform_name?: string;
        status?: string;
        api_endpoint?: string;
    }>;
} | null;

const getPlainTextContent = (content: string) =>
    (content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

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
        className="min-w-9 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
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

const triggerEditorInput = (editorElement?: HTMLElement) => {
    if (!editorElement) {
        return;
    }

    editorElement.dispatchEvent(new Event("input", { bubbles: true }));
};

const getSelectedTableCell = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const node =
        range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as Element)
            : range.startContainer.parentElement;

    return node?.closest("td") as HTMLTableCellElement | null;
};

const ensureTableHeader = (table: HTMLTableElement) => {
    if (table.querySelector("thead")) {
        return;
    }

    const firstRow = table.querySelector("tr");
    if (!firstRow) {
        return;
    }

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    Array.from(firstRow.cells).forEach((cell, index) => {
        const headerCell = document.createElement("th");
        headerCell.innerHTML = cell.innerHTML || `Header ${index + 1}`;
        headerCell.style.border = "1px solid #d1d5db";
        headerCell.style.padding = "8px";
        headerCell.style.minWidth = "120px";
        headerCell.style.fontWeight = "600";
        headerCell.style.background = "#f8fafc";
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.insertBefore(thead, table.firstChild);
    firstRow.remove();

    let tbody = table.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
};

const buildTableHtml = (rows: number, columns: number) => {
    const headerRow = Array.from({ length: columns }, (_, columnIndex) =>
        `<th style="border:1px solid #d1d5db;padding:8px;min-width:120px;font-weight:600;background:#f8fafc;">Header ${columnIndex + 1}</th>`
    ).join("");

    const bodyRows = Array.from({ length: rows }, (_, rowIndex) => {
        const cells = Array.from({ length: columns }, (_, columnIndex) =>
            `<td style="border:1px solid #d1d5db;padding:8px;min-width:120px;">Cell ${rowIndex + 1}-${columnIndex + 1}</td>`
        ).join("");

        return `<tr>${cells}</tr>`;
    }).join("");

    return `
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
            <thead>
                <tr>${headerRow}</tr>
            </thead>
            <tbody>${bodyRows}</tbody>
        </table>
        <p></p>
    `;
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
                className="min-w-9 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
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

const RichTextToolbar = ({
    platformData,
    content,
}: {
    platformData: EditorPlatformData;
    content: string;
}) => {
    const editorState = useEditorState();
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [hasLinkSelection, setHasLinkSelection] = useState(false);
    const [isTableContextActive, setIsTableContextActive] = useState(false);
    const savedRangeRef = useRef<Range | null>(null);
    const plainTextContent = getPlainTextContent(content);
    const wordCount = plainTextContent ? plainTextContent.split(" ").length : 0;
    const characterCount = plainTextContent.length;

    useEffect(() => {
        const updateTableContext = () => {
            setIsTableContextActive(Boolean(getSelectedTableCell()));
        };

        document.addEventListener("selectionchange", updateTableContext);
        updateTableContext();

        return () => {
            document.removeEventListener("selectionchange", updateTableContext);
        };
    }, []);

    if (editorState.htmlMode) {
        return (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <HtmlButton />
                <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                    <span>Words: {wordCount}</span>
                    <span>Characters: {characterCount}</span>
                </div>
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

    const handleOpenTableModal = () => {
        savedRangeRef.current = getCurrentRange();
        setIsTableModalOpen(true);
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


    const handleInsertTable = ({ rows, columns }: { rows: number; columns: number }) => {
        focusEditor(editorElement);
        restoreRange(savedRangeRef.current);
        document.execCommand("insertHTML", false, buildTableHtml(rows, columns));
        triggerEditorInput(editorElement);
        setIsTableModalOpen(false);
    };

    const updateSelectedTable = (action: "addRow" | "removeRow" | "addColumn" | "removeColumn" | "removeTable") => {
        const cell = getSelectedTableCell();
        const row = cell?.parentElement as HTMLTableRowElement | null;
        const tableSection = row?.parentElement as HTMLTableSectionElement | null;
        const table = cell?.closest("table") as HTMLTableElement | null;

        if (!cell || !row || !table) {
            return;
        }

        ensureTableHeader(table);

        const columnIndex = cell.cellIndex;

        if (action === "addRow") {
            const newRow = row.cloneNode(true) as HTMLTableRowElement;
            Array.from(newRow.cells).forEach((tableCell, index) => {
                tableCell.innerHTML = `Cell ${table.rows.length + 1}-${index + 1}`;
            });
            row.insertAdjacentElement("afterend", newRow);
        }

        if (action === "removeRow") {
            if (table.rows.length <= 1) {
                table.remove();
            } else {
                row.remove();
            }
        }

        if (action === "addColumn") {
            Array.from(table.rows).forEach((tableRow, rowIndex) => {
                const referenceCell = tableRow.cells[columnIndex] || tableRow.cells[tableRow.cells.length - 1];
                const isHeaderRow = tableRow.parentElement?.tagName === "THEAD";
                const newCell = document.createElement(isHeaderRow ? "th" : "td");
                newCell.style.border = "1px solid #d1d5db";
                newCell.style.padding = "8px";
                newCell.style.minWidth = "120px";
                if (isHeaderRow) {
                    newCell.style.fontWeight = "600";
                    newCell.style.background = "#f8fafc";
                    newCell.innerHTML = `Header ${tableRow.cells.length + 1}`;
                } else {
                    newCell.innerHTML = `Cell ${rowIndex}-${tableRow.cells.length + 1}`;
                }
                tableRow.insertBefore(newCell, referenceCell?.nextSibling || null);
            });
        }

        if (action === "removeColumn") {
            Array.from(table.rows).forEach((tableRow) => {
                if (tableRow.cells.length > columnIndex) {
                    tableRow.deleteCell(columnIndex);
                }
            });

            const firstRow = table.rows[0];
            if (!firstRow || firstRow.cells.length === 0) {
                table.remove();
            }
        }

        if (action === "removeTable") {
            table.remove();
        }

        triggerEditorInput(editorElement);
        if (action !== "removeTable") {
            focusEditor(editorElement);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
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
                    title="Subscript"
                    icon={<SubscriptIcon size={15} />}
                    onAction={() => runEditorCommand(editorElement, "subscript", undefined, savedRangeRef.current)}
                />
                <ToolbarButton
                    title="Superscript"
                    icon={<SuperscriptIcon size={15} />}
                    onAction={() => runEditorCommand(editorElement, "superscript", undefined, savedRangeRef.current)}
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
                <ToolbarButton
                    title="Increase List Level"
                    icon={<ListIndentIncrease size={15} />}
                    onAction={() =>
                        runEditorCommand(editorElement, "indent", undefined, savedRangeRef.current)
                    }
                />
                <ToolbarButton
                    title="Decrease List Level"
                    icon={<ListIndentDecrease size={15} />}
                    onAction={() =>
                        runEditorCommand(editorElement, "outdent", undefined, savedRangeRef.current)
                    }
                />
                <ToolbarButton title="Link" icon={<LinkIcon size={15} />} onAction={handleOpenLinkModal} />
                <ToolbarButton
                    title="Insert Table"
                    icon={<Table size={15} />}
                    onAction={handleOpenTableModal}
                />
                {isTableContextActive && (
                    <>
                        <ToolbarButton
                            title="Add Row"
                            icon={<span className="text-[11px] font-semibold">R+</span>}
                            onAction={() => updateSelectedTable("addRow")}
                        />
                        <ToolbarButton
                            title="Remove Row"
                            icon={<span className="text-[11px] font-semibold">R-</span>}
                            onAction={() => updateSelectedTable("removeRow")}
                        />
                        <ToolbarButton
                            title="Add Column"
                            icon={<span className="text-[11px] font-semibold">C+</span>}
                            onAction={() => updateSelectedTable("addColumn")}
                        />
                        <ToolbarButton
                            title="Remove Column"
                            icon={<span className="text-[11px] font-semibold">C-</span>}
                            onAction={() => updateSelectedTable("removeColumn")}
                        />
                        <ToolbarButton
                            title="Remove Table"
                            icon={<Trash2 size={15} />}
                            onAction={() => updateSelectedTable("removeTable")}
                        />
                    </>
                )}

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
                    icon={<ImageIcon size={15} />}
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

                <div className="ml-auto flex items-center gap-3 text-sm text-black">
                    <span>Words: {wordCount}</span>
                    <span>Characters: {characterCount}</span>
                </div>
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
            <TableModal
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                onSubmit={handleInsertTable}
            />
            {isImageModalOpen &&
                <UploadMediaModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    platformData={platformData}
                    allowedMediaType="all"
                    onSelectMedia={({ url, fileType }) => {
                        const normalizedUrl =
                            url.startsWith("http://") || url.startsWith("https://")
                                ? url
                                : `${process.env.BACKEND_DOMAIN}/${url}`;

                        if (fileType === "video") {
                            focusEditor(editorElement);
                            restoreRange(savedRangeRef.current);
                            document.execCommand(
                                "insertHTML",
                                false,
                                `<video controls preload="metadata" style="max-width:100%;height:auto;" src="${escapeHtml(normalizedUrl)}"></video>`,
                            );
                        } else {
                            runEditorCommand(
                                editorElement,
                                "insertImage",
                                normalizedUrl,
                                savedRangeRef.current,
                            );
                        }
                        setIsImageModalOpen(false);
                    }}
                />
            }
        </>
    );
};

export default RichTextToolbar;
