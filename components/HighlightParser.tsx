import { cn } from '@/lib/utils'

import { PointerHighlight } from './ui/pointer-highlight'

interface HighlightParserProps {
  text: string
  className?: string
}

export function HighlightParser({ text, className }: HighlightParserProps) {
  if (!text) return null
  const parts = text.split(/(<hilight>.*?<\/hilight>)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<hilight>') && part.endsWith('</hilight>')) {
          const content = part.replace(/<\/?hilight>/g, '')
          return (
            <PointerHighlight
              key={index}
              rectangleClassName="bg-neutral-700/70 border-neutral-600"
              pointerClassName="text-yellow-500"
            >
              <mark
                className={cn(
                  'relative z-10 bg-transparent text-inherit font-inherit',
                  className,
                )}
              >
                {content}
              </mark>
            </PointerHighlight>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
