import { Suspense } from 'react'

import type { Metadata } from 'next'

import { Spinner } from '@/components/ui/spinner'

import { StoreTransferAcceptClient } from './_components/StoreTransferAcceptClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ยืนยันการรับโอนร้านค้า | Sitepow Store',
  description: 'หน้ารับโอนสิทธิ์ความเป็นเจ้าของร้านค้า Sitepow Store',
}

interface StoreTransferPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function StoreTransferPage(props: StoreTransferPageProps) {
  const params = await props.params
  const { token } = params

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Spinner className="text-primary h-8 w-8" />
        </div>
      }
    >
      <StoreTransferAcceptClient token={token} />
    </Suspense>
  )
}
