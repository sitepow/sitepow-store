'use client'

import React, { ComponentProps } from 'react'

import { IconAlertCircle } from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ActionRequiredAlertProps extends Omit<
  ComponentProps<typeof Alert>,
  'title'
> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}

export function ActionRequiredAlert({
  title = 'โปรดเลือกร้านค้า',
  description = 'กรุณาเลือกร้านค้าที่ต้องการก่อนเพื่อดำเนินการต่อ',
  icon = <IconAlertCircle />,
  ...props
}: ActionRequiredAlertProps) {
  return (
    <Alert {...props}>
      <AlertTitle className="flex flex-wrap items-center gap-2">
        {icon}
        {title}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
