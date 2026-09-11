/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { KeyboardEvent, useState } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useStoreData } from '@/stores/sites/use-store-data'
import { IconBolt, IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  register: UseFormRegister<any>
  setValue?: UseFormSetValue<any>
  disabled?: boolean
  showQuickReplies?: boolean
}

export function ChatInput({
  onSubmit,
  register,
  setValue,
  disabled,
  showQuickReplies = true,
}: ChatInputProps) {
  const t = useTranslations('merchant.chat')
  const { store } = useStoreData()
  const [isFocused, setIsFocused] = useState(false)

  const quickReplies = [
    t('quickReply1'),
    t('quickReply2'),
    t('quickReply3'),
    t('quickReply4'),
    t('quickReply5'),
  ]

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleSelectQuickReply = (text: string) => {
    if (setValue) {
      setValue('content', text, { shouldValidate: true, shouldDirty: true })
    }
  }

  return (
    <div
      className="border-border/60 bg-background flex flex-col border-t"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      {showQuickReplies && setValue && (
        <div className="border-border/40 flex items-center gap-1.5 overflow-x-auto border-b px-3 py-1.5 text-xs">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs font-normal"
              >
                <IconBolt className="size-3 text-amber-500" />
                <span>{t('quickRepliesShort')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-1">
              {quickReplies.map((reply, i) => (
                <DropdownMenuItem
                  key={i}
                  className="cursor-pointer text-xs"
                  onClick={() => handleSelectQuickReply(reply)}
                >
                  {reply}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {quickReplies.slice(0, 3).map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectQuickReply(reply)}
                className="bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex shrink-0 items-center truncate rounded-md px-2 py-0.5 text-[11px] transition-colors"
                title={reply}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2 p-3">
        <div className="relative flex-1">
          <Textarea
            {...register('content')}
            placeholder={t('typeReplyPlaceholder')}
            rows={1}
            className="border-input/60 focus-visible:border-primary max-h-32 min-h-10 resize-none py-2 text-sm leading-relaxed"
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isFocused && (
            <span className="text-muted-foreground/60 absolute right-2 bottom-1.5 hidden text-[10px] select-none sm:inline">
              {t('enterToSendHint')}
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={disabled}
          size="icon"
          className="size-10 shrink-0 shadow-xs"
        >
          <IconSend2 className="size-4" />
        </Button>
      </form>
    </div>
  )
}
