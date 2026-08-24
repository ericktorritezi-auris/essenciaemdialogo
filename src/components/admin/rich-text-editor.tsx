"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { MediaPicker } from "@/components/admin/media-picker";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

/**
 * Editor visual (Sprint 5 — substitui o textarea de texto puro da
 * Sprint 2, conforme combinado). A saída é sempre HTML.
 *
 * IMPORTANTE: isto muda só a EXPERIÊNCIA de edição. A sanitização
 * continua sendo feita no servidor (`src/lib/sanitize.ts`) antes de
 * qualquer gravação no banco — o Tiptap não é, e nunca foi, a camada
 * de segurança. Mesmo que alguém consiga manipular o HTML enviado por
 * fora deste editor, o servidor filtra por allowlist do mesmo jeito.
 */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory focus:outline-none prose-headings:font-display",
      },
    },
    immediatelyRender: false,
  });

  // Sincroniza se o `value` mudar de fora (ex.: ao carregar os dados
  // do episódio/artigo depois do editor já ter montado).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  function applyLink() {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setLinkPromptOpen(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t border border-b-0 border-bronze/30 bg-warm-black p-2">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        >
          H4
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Citação
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={editor.isActive("link")} onClick={() => setLinkPromptOpen((v) => !v)}>
          Link
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => setShowMediaPicker((v) => !v)}>
          Imagem
        </ToolbarButton>
      </div>

      {linkPromptOpen && (
        <div className="flex gap-2 border border-b-0 border-bronze/30 bg-warm-black p-2">
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 rounded border border-bronze/30 bg-charcoal px-2 py-1 text-sm text-ivory"
          />
          <button type="button" onClick={applyLink} className="rounded bg-terracotta px-3 py-1 text-sm text-ivory">
            Aplicar
          </button>
        </div>
      )}

      {showMediaPicker && (
        <div className="border border-b-0 border-bronze/30 bg-warm-black p-2">
          <MediaPicker
            value={null}
            onChange={(_mediaId, media) => {
              if (media) {
                editor.chain().focus().setImage({ src: media.url, alt: media.altText ?? "" }).run();
              }
              setShowMediaPicker(false);
            }}
          />
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${
        active ? "bg-terracotta text-ivory" : "text-ivory/70 hover:bg-charcoal"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-bronze/30" />;
}
