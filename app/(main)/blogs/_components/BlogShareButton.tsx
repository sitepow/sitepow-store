'use client'

import { useTranslations } from 'next-intl'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Check, Copy, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function BlogShareButton({ title }: { title: string }) {
  const t = useTranslations('blogs')
  const { copied, copy } = useCopyToClipboard()

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        })
        return
      } catch {}
    }
    if (typeof window !== 'undefined') {
      await copy(window.location.href)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="cursor-pointer gap-2 rounded-xl text-xs font-semibold"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-500" />
          <span>{t('copiedLink')}</span>
        </>
      ) : (
        <>
          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <Share2 className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span>{t('shareArticle')}</span>
        </>
      )}
    </Button>
  )
}
