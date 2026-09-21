'use client'

import { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
}: StatsCardProps) {
  return (
    <Card className="py-3 sm:py-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 sm:px-6">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Button
          variant="outline"
          size="icon-lg"
          className="bg-primary hover:bg-primary shrink-0"
        >
          <Icon className="size-4 text-white" />
        </Button>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="text-lg font-bold sm:text-2xl">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  )
}
