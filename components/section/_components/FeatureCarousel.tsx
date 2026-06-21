/* eslint-disable @typescript-eslint/no-explicit-any */
import { FeatureCard } from './FeatureCard'

interface FeatureCarouselProps {
  features: any[]
  emblaRef: any
}

export const FeatureCarousel = ({
  features,
  emblaRef,
}: FeatureCarouselProps) => (
  <div className="min-w-0 overflow-hidden" ref={emblaRef}>
    <div className="flex gap-4">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className="min-w-0 flex-[0_0_100%] md:flex-[0_0_80%] xl:flex-[0_0_50%]"
        >
          <FeatureCard {...feature} />
        </div>
      ))}
    </div>
  </div>
)
