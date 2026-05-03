import type { ReactNode } from 'react'

import { FeatureCard as FeatureCardType } from '@/types/payment'

interface FeatureCardProps extends FeatureCardType {
  image?: string
  icon?: ReactNode
}

export function FeatureCard({
  title,
  description,
  image,
  icon,
}: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 text-start shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
            {icon}
          </div>
        )}
      </div>

      <h3 className="group-hover:text-primary mb-2 text-xl font-bold text-gray-900 transition-colors sm:text-2xl">
        {title}
      </h3>

      <p className="leading-relaxed text-gray-500 opacity-80 sm:text-lg">
        {description}
      </p>

      {image && (
        <div className="relative mt-6 overflow-hidden rounded-xl border-2 border-dashed border-gray-100">
          <div className="flex h-48 w-full items-center justify-center" />
        </div>
      )}
    </div>
  )
}
