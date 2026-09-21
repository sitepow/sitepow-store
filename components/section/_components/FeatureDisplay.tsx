/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react'

import Image from 'next/image'

import { SECOND } from '@/constants/system'
import Autoplay from 'embla-carousel-autoplay'
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false }, [
    Autoplay({ delay: 3 * SECOND, stopOnInteraction: true }),
  ])

  return (
    <SectionContainer className="gap-0">
      <div className="relative overflow-hidden rounded-t-3xl bg-slate-900 p-8 text-white md:p-12">
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt="feature-landing-background"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            width={800}
            height={800}
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
      <div className="bg-foreground/30 mx-auto h-8 w-full rounded-b-3xl" />
      <div className="bg-foreground/20 mx-auto h-8 w-[85%] rounded-b-3xl sm:w-[90%] lg:w-[95%]" />
      <div className="bg-foreground/10 mx-auto h-8 w-[70%] rounded-b-3xl sm:w-[80%] lg:w-[90%]" />
    </SectionContainer>
  )
}
