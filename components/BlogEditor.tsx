'use client'

import { useEffect, useRef } from 'react'

import { thDictionary } from '@/constants/editor/blocknote'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import { useTheme } from '@teispace/next-themes'

interface BlogEditorProps {
  value?: string
  onChange?: (markdown: string) => void
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const { resolvedTheme } = useTheme()

  const editor = useCreateBlockNote({
    dictionary: thDictionary,
  })

  const lastMarkdownRef = useRef<string>('')

  useEffect(() => {
    const syncValueToEditor = async () => {
      if (!editor) {
        return
      }

      const incomingValue = value || ''

      if (incomingValue !== lastMarkdownRef.current) {
        lastMarkdownRef.current = incomingValue

        const blocks = await editor.tryParseMarkdownToBlocks(incomingValue)
        editor.replaceBlocks(editor.document, blocks)
      }
    }

    syncValueToEditor()
  }, [value, editor])

  const handleContentChange = async () => {
    if (!editor) {
      return
    }
    const markdown = await editor.blocksToMarkdownLossy(editor.document)

    lastMarkdownRef.current = markdown
    onChange?.(markdown)
  }

  return (
    <div className="min-h-96 rounded-xl border p-5 font-sans dark:bg-[#1f1f1f] [&_.bn-container]:font-sans">
      <BlockNoteView
        editor={editor}
        onChange={handleContentChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}
