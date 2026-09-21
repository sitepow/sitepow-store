/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { KeyboardEvent } from 'react'
import { UseFormRegister } from 'react-hook-form'

import { useStoreData } from '@/stores/sites/use-store-data'
import { IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  register: UseFormRegister<any>
  disabled?: boolean
}

export function ChatInput({ onSubmit, register, disabled }: ChatInputProps) {
  const { store } = useStoreData()
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 border-t p-4"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <Textarea
        {...register('content')}
        placeholder="พิมพ์ข้อความ..."
        className="max-h-32 min-h-11 resize-none"
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" disabled={disabled} className="size-11 shrink-0">
        <IconSend2 size={20} />
      </Button>
    </form>
  )
}
