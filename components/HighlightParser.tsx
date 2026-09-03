'use client'

import { useIsMounted } from '@/hooks/use-is-mounted'

import { cn } from '@/lib/utils'

import { PointerHighlight } from './ui/pointer-highlight'

interface HighlightParserProps {
  text: string
  className?: string
}

export function HighlightParser({ text, className }: HighlightParserProps) {
  const isMounted = useIsMounted()

  if (!isMounted) {
    const cleanText = text ? text.replace(/<\/?hilight>/g, '') : ''
    return <span className={className}>{cleanText}</span>
  }

  const parts = text.split(/(<hilight>.*?<\/hilight>)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<hilight>') && part.endsWith('</hilight>')) {
          const content = part.replace(/<\/?hilight>/g, '')
          return (
            <PointerHighlight
              key={index}
              rectangleClassName="bg-neutral-700 border-neutral-600"
              pointerClassName="text-yellow-500"
            >
              <span className={cn('relative z-10', className)}>{content}</span>
            </PointerHighlight>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
