'use client'

import React from 'react'

import { IconAlertCircle } from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ActionRequiredAlertProps {
  title?: React.ReactNode
  description?: React.ReactNode
}

export function ActionRequiredAlert({
  title = 'โปรดเลือกร้านค้า',
  description = 'กรุณาเลือกร้านค้าที่ต้องการก่อนเพื่อดำเนินการต่อ',
}: ActionRequiredAlertProps) {
  return (
    <Alert>
      <AlertTitle className="flex flex-wrap items-center gap-2">
        <IconAlertCircle className="text-primary" />
        {title}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
