import type { ComponentType } from 'react'

import { FeatureCard as FeatureCardType } from '@/types/payment'

import { PageTabHeaderIcon } from '@/components/PageTabHeaderIcon'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface FeatureCardProps extends FeatureCardType {
  image?: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export function FeatureCard({
  title,
  description,
  image,
  icon,
}: FeatureCardProps) {
  return (
    <Card className="group text-start">
      <CardHeader>
        <div className="mb-4 flex items-center gap-3">
          {icon && (
            <PageTabHeaderIcon
              className="text-primary border-primary bg-primary/5"
              icon={icon}
            />
          )}
        </div>
        <h3 className="group-hover:text-primary text-xl font-bold sm:text-2xl">
          {title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed text-gray-500 opacity-80">
          {description}
        </p>
        {image && (
          <div className="relative mt-6 overflow-hidden rounded-xl border-2 border-dashed border-gray-100">
            <div className="flex h-48 w-full items-center justify-center" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
