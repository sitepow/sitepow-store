'use client'

import Image from 'next/image'

import { FALLBACK_MERCHANT_BANNER_IMAGE } from '@/constants/system'
import { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  bgImage?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  bgImage = FALLBACK_MERCHANT_BANNER_IMAGE,
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-neutral-900 p-3 shadow-sm sm:p-5">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={bgImage}
          alt={title}
          fill
          className="object-cover opacity-40"
        />
      </div>
      <div className="relative z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            {title}
          </CardTitle>
          <Button variant="outline" size="icon-lg" className="dark">
            <Icon className="size-4 shrink-0 text-white" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="font-bold text-white sm:text-2xl">{value}</div>
          <p className="text-xs text-neutral-300 opacity-80">{description}</p>
        </CardContent>
      </div>
    </Card>
  )
}
