'use client'

import { PointerHighlight } from './ui/pointer-highlight'

interface HighlightParserProps {
  text: string
}

export function HighlightParser({ text }: HighlightParserProps) {
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
              <span className="relative z-10">{content}</span>
            </PointerHighlight>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
