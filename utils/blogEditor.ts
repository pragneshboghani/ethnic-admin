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

type Props = {
  content: string;
  setContent: (value: string) => void;
};

const blogEditor = ({ content, setContent }: Props) => {
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
            return ["tag1", "tag2", "ankit", "blog"].filter((item) =>
              item.toLowerCase().startsWith(query.toLowerCase()),
            );
          },
        },
      }),
    ],
    content: content,
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

export default blogEditor;
