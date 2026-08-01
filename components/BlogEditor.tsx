'use client'

import { useEffect, useRef } from 'react'

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
  const editor = useCreateBlockNote()
  const isInitialRender = useRef(true)

  useEffect(() => {
    const loadInitialContent = async () => {
      if (isInitialRender.current && value && editor) {
        isInitialRender.current = false
        const blocks = await editor.tryParseMarkdownToBlocks(value)
        editor.replaceBlocks(editor.document, blocks)
      }
    }

    loadInitialContent()
  }, [value, editor])

  const handleContentChange = async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    onChange?.(markdown)
  }

  return (
    <div className="min-h-96 rounded-xl border p-5 dark:bg-[#1f1f1f]">
      <BlockNoteView
        editor={editor}
        onChange={handleContentChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}
