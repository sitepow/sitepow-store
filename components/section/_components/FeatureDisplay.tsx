/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react'

import useEmblaCarousel from 'embla-carousel-react'

import { SectionContainer } from '@/components/SectionContainer'

import { FeatureCarousel } from './FeatureCarousel'
import { FeatureControls } from './FeatureControls'

interface FeatureDisplayProps {
  imageUrl: string
  sectionHeader: ReactNode
  featuresList: any[]
  isLeft?: boolean
}

export function FeatureDisplay({
  isLeft = true,
  imageUrl,
  sectionHeader,
  featuresList,
}: FeatureDisplayProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

  return (
    <SectionContainer>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white md:p-12">
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Feature background"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 grid min-w-0 gap-10 lg:grid-cols-2">
          {isLeft ? (
            <>
              <div className="flex min-w-0 flex-col items-center justify-center">
                {sectionHeader}
              </div>
              <div className="relative min-w-0">
                <FeatureCarousel features={featuresList} emblaRef={emblaRef} />
                <FeatureControls
                  onPrev={() => emblaApi?.scrollPrev()}
                  onNext={() => emblaApi?.scrollNext()}
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative min-w-0">
                <FeatureCarousel features={featuresList} emblaRef={emblaRef} />
                <FeatureControls
                  onPrev={() => emblaApi?.scrollPrev()}
                  onNext={() => emblaApi?.scrollNext()}
                />
              </div>
              <div className="flex min-w-0 flex-col items-center justify-center">
                {sectionHeader}
              </div>
            </>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
