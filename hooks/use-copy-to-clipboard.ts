import { useState } from 'react'

export function useCopyToClipboard(resetInterval = 2000) {
  const [copied, setCopied] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = async (text: string, key?: string) => {
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
      if (key !== undefined) {
        setCopiedKey(key)
      }

      setTimeout(() => {
        setCopied(false)
        if (key !== undefined) {
          setCopiedKey(null)
        }
      }, resetInterval)
    } catch {
      setCopied(false)
      setCopiedKey(null)
    }
  }

  const isCopied = (key?: string) => {
    if (key !== undefined) {
      return copiedKey === key
    }
    return copied
  }

  return { copied, copiedKey, copy, isCopied }
}
