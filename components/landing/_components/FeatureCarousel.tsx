/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

import { cn } from '@/lib/utils'

import { FeatureCard } from './FeatureCard'

export const FeatureCarousel = ({ features, emblaRef }: any) => {
  const isDesktop = useMediaQuery('(min-width: 1536px)')

  const shouldShowGrid = isDesktop

  const groupedFeatures = useMemo(() => {
    return shouldShowGrid
      ? Array.from({ length: Math.ceil(features.length / 4) }, (_, i) =>
          features.slice(i * 4, i * 4 + 4),
        )
      : Array.from({ length: Math.ceil(features.length / 2) }, (_, i) =>
          features.slice(i * 2, i * 2 + 2),
        )
  }, [features, shouldShowGrid])

  return (
    <div className="min-w-0 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {groupedFeatures.map((group: any, groupIdx: number) => (
          <div
            key={groupIdx}
            className={cn(
              'grid min-w-0 flex-[0_0_100%] gap-4 p-2',
              shouldShowGrid ? 'grid-cols-2' : 'grid-cols-1',
              shouldShowGrid && group?.length < 3 && 'h-fit',
            )}
          >
            {group.map((feature: any, idx: number) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
