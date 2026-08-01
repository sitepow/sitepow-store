'use client'

import { LucideIcon } from 'lucide-react'

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
  bgImage = '/images/hero-section/section-5.jpeg',
}: StatsCardProps) {
  return (
    <Card
      className="relative overflow-hidden bg-cover bg-center transition-all"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {bgImage && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      )}
      <div className="relative z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            {title}
          </CardTitle>
          <Icon className="size-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          <p className="text-xs text-neutral-300">{description}</p>
        </CardContent>
      </div>
    </Card>
  )
}
