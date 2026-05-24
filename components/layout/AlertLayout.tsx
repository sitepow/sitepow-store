import { ReactNode } from 'react'

import { IconAlertCircle } from '@tabler/icons-react'

interface AlertLayoutProps {
  icon?: ReactNode
  title: ReactNode
}

export function AlertLayout({
  icon = <IconAlertCircle size={35} />,
  title,
}: AlertLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center text-xl font-bold">
      {icon}
      <h1 className="max-w-1/2">{title}</h1>
    </div>
  )
}
