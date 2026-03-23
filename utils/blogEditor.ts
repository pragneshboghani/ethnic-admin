import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { useEffect, useRef } from "react";

type Props = {
  content: string;
  setContent: (value: string) => void;
  platformData: any;
  allBlogs: { data: any[] };
  categories: { id: number; name: string }[];
  tagsList: { id: number; name: string }[];
};

function updateList(element: HTMLElement, props: any) {
  element.innerHTML = "";

  props.items.forEach((item: any) => {
    const div = document.createElement("div");
    div.className =
      "px-2 py-1 cursor-pointer hover:bg-gray-100 hover:text-black";

    div.innerText = item.label;

    div.onclick = () => {
      props.command({
        id: item.id,
        label: item.label,
      });
    };

    element.appendChild(div);
  });
}

const useBlogEditor = ({  content = "",  setContent,  platformData,  allBlogs,  categories,  tagsList,}: Props) => {
  const mentionListRef = useRef<any[]>([]);

  useEffect(() => {
    mentionListRef.current = [
      ...(platformData?.data?.map((p: any) => ({
        id: `platform-${p.id}`,
        label: p.platform_name,
        type: "platform",
        url: p.website_url,
      })) || []),

      ...(allBlogs?.data?.map((b: any) => ({
        id: `blog-${b.id}`,
        label: b.blog_title,
        type: "blog",
        url: "#",
      })) || []),

      ...(categories?.map((c: any) => ({
        id: `category-${c.id}`,
        label: c.name,
        type: "category",
      })) || []),

      ...(tagsList?.map((t: any) => ({
        id: `tag-${t.id}`,
        label: t.name,
        type: "tag",
      })) || []),
    ];
  }, [platformData, allBlogs, categories, tagsList]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Highlight,
      Underline,
      Image,
      ImageResize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,

      CharacterCount.configure({
        limit: 10000,
      }),

      Placeholder.configure({
        placeholder: "Write your Content here...",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "text-blue-500 font-medium",
        },
        suggestion: {
          items: ({ query }: any) => {
            return mentionListRef.current.filter((item: any) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
            );
          },

          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props: any) => {
                component = document.createElement("div");
                component.className = "shadow rounded p-2";

                updateList(component, props);

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },

              onUpdate(props: any) {
                updateList(component, props);
              },

              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                return false;
              },

              onExit() {
                popup[0].destroy();
              },
            };
          },
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.text(text),
              false,
            ),
          );
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  return editor;
};

export default useBlogEditor;
