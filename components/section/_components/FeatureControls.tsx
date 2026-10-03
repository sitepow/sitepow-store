import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FeatureControlsProps {
  onPrev: () => void
  onNext: () => void
}

export const FeatureControls = ({ onPrev, onNext }: FeatureControlsProps) => (
  <div className="mt-6 flex gap-2">
    <button
      type="button"
      onClick={onPrev}
      aria-label="สไลด์ก่อนหน้า"
      className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <ChevronLeft aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onNext}
      aria-label="สไลด์ถัดไป"
      className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <ChevronRight aria-hidden="true" />
    </button>
  </div>
)
