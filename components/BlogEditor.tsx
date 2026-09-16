'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useLocale } from 'next-intl'

import { getBlockNoteDictionary } from '@/constants/blocknote'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import { useTheme } from '@teispace/next-themes'

import { cn } from '@/lib/utils'

interface BlogEditorProps {
  value?: string
  onChange?: (markdown: string) => void
  className?: string
  locale?: string
}

export default function BlogEditor({
  value,
  onChange,
  className,
  locale: propLocale,
}: BlogEditorProps) {
  const activeLocale = useLocale()
  const currentLocale = propLocale || activeLocale
  const { resolvedTheme } = useTheme()

  const dictionary = useMemo(
    () => getBlockNoteDictionary(currentLocale),
    [currentLocale],
  )

  const editor = useCreateBlockNote(
    {
      dictionary,
    },
    [currentLocale],
  )

  const lastMarkdownRef = useRef<string>('')
  const lastEditorRef = useRef(editor)

  useEffect(() => {
    const syncValueToEditor = async () => {
      if (!editor) {
        return
      }

      const incomingValue = value || ''
      const isNewEditor = lastEditorRef.current !== editor

      if (isNewEditor || incomingValue !== lastMarkdownRef.current) {
        lastEditorRef.current = editor
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
    <div
      className={cn(
        'min-h-96 w-full overflow-x-auto rounded-xl border p-3 font-sans sm:p-5 dark:bg-[#1f1f1f] [&_.bn-container]:font-sans',
        className,
      )}
    >
      <BlockNoteView
        editor={editor}
        onChange={handleContentChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}
