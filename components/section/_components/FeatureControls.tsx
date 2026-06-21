import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FeatureControlsProps {
  onPrev: () => void
  onNext: () => void
}

export const FeatureControls = ({ onPrev, onNext }: FeatureControlsProps) => (
  <div className="mt-6 flex gap-2">
    <button
      onClick={onPrev}
      className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <ChevronLeft />
    </button>
    <button
      onClick={onNext}
      className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <ChevronRight />
    </button>
  </div>
)
