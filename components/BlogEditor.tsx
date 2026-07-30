'use client'

import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'

interface BlogEditorProps {
  onChange?: (markdown: string) => void
}

export default function BlogEditor({ onChange }: BlogEditorProps) {
  const editor = useCreateBlockNote()

  const handleContentChange = async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    onChange?.(markdown)
  }

  return (
    <div className="bg-background min-h-100 rounded-lg border p-4">
      <BlockNoteView editor={editor} onChange={handleContentChange} />
    </div>
  )
}
