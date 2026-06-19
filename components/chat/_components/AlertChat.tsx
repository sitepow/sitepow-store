import { IconAlertCircle } from '@tabler/icons-react'

interface AlertChatProps {
  title: string
}

export function AlertChat({ title }: AlertChatProps) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm">
      <IconAlertCircle />
      {title}
    </div>
  )
}
