import { useState } from 'react'

export function useCopyToClipboard(resetInterval = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    if (!text) {
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), resetInterval)
    } catch {
      setCopied(false)
    }
  }

  return { copied, copy }
}
