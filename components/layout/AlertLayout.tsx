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
    <div className="text-foreground flex min-h-screen flex-col items-center justify-center gap-1 text-center text-xl font-bold">
      {icon}
      <h1 className="p-5 sm:max-w-1/2">{title}</h1>
    </div>
  )
}
