"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef } from "react"

type Props = {
  initialContent?: string | null
  onChange?: (html: string) => void
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-amber-200 text-amber-900"
          : "text-amber-600 hover:bg-amber-100 hover:text-amber-900"
      }`}
    >
      {children}
    </button>
  )
}

export default function NotesEditor({ initialContent, onChange }: Props) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialContent ?? "",
    editorProps: {
      attributes: {
        class: "outline-none min-h-[120px] text-sm text-amber-900 leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current?.(editor.getHTML())
    },
  })

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  return (
    <div className="rounded-xl border border-amber-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-amber-200 bg-amber-50 px-2 py-1.5">
        <ToolbarButton
          title="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <span className="mx-1 border-l border-amber-200" />
        <ToolbarButton
          title="Heading 2"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="mx-1 border-l border-amber-200" />
        <ToolbarButton
          title="Bullet list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <span className="mx-1 border-l border-amber-200" />
        <ToolbarButton
          title="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="px-4 py-3 bg-white [&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:text-amber-900 [&_.tiptap_h2]:mb-1 [&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:text-amber-900 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_li]:my-0.5 [&_.tiptap_p]:my-1 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-amber-300 [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-amber-700">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
