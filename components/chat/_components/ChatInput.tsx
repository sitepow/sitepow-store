import { IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatInput({ onSubmit, register, disabled }: any) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 border-t p-4">
      <Textarea {...register('content')} placeholder="พิมพ์ข้อความ..." />
      <Button type="submit" disabled={disabled} className="shrink-0">
        <IconSend2 />
      </Button>
    </form>
  )
}
