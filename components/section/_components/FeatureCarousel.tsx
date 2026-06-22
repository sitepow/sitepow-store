/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMediaQuery } from '@/hooks/use-media-query'

import { FeatureCard } from './FeatureCard'

export const FeatureCarousel = ({ features, emblaRef }: any) => {
  const isMounted = useIsMounted()
  const isDesktop = useMediaQuery('(min-width: 1536px)')

  const shouldShowGrid = isMounted && isDesktop

  const groupedFeatures = useMemo(() => {
    return shouldShowGrid
      ? Array.from({ length: Math.ceil(features.length / 4) }, (_, i) =>
          features.slice(i * 4, i * 4 + 4),
        )
      : features.map((f: any) => [f])
  }, [features, shouldShowGrid])

  return (
    <div className="min-w-0 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {groupedFeatures.map((group: any, groupIdx: number) => (
          <div
            key={groupIdx}
            className={`grid min-w-0 flex-[0_0_100%] gap-4 p-2 ${
              shouldShowGrid
                ? `grid-cols-2 ${group?.length < 3 && 'h-fit'}`
                : 'grid-cols-1'
            }`}
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
