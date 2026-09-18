'use client'

import { useState } from 'react'

import { IconCheck, IconCopy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground bg-background/60 hover:bg-background/90 absolute top-2 right-2 z-10 h-7 w-7"
        title="Copy code"
      >
        {copied ? (
          <IconCheck size={14} className="text-green-500" />
        ) : (
          <IconCopy size={14} />
        )}
      </Button>
      <pre className="border-border/50 dark:border-border overflow-x-auto rounded-xl border bg-slate-950 p-4 text-xs leading-relaxed text-slate-50">
        <code>{code}</code>
      </pre>
    </div>
  )
}
