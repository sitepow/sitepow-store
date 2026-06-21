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
    <Card className="group h-full border border-white/20 bg-transparent text-start text-white backdrop-blur-md">
      <CardHeader>
        <div className="mb-4 flex items-center gap-3">
          {icon && (
            <PageTabHeaderIcon
              className="border-white bg-white/5 text-white"
              icon={icon}
            />
          )}
        </div>
        <h3 className="text-xl font-bold sm:text-2xl">{title}</h3>
      </CardHeader>
      <CardContent className="-mt-5">
        <p className="text-lg leading-relaxed opacity-60">{description}</p>
        {image && (
          <div className="border-border relative mt-6 overflow-hidden rounded-xl border-2 border-dashed">
            <div className="flex h-48 w-full items-center justify-center" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
