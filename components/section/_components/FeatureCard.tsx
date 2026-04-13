import type { FeatureCard } from '@/types/payment'

interface FeatureCardProps extends FeatureCard {
  image?: string
}

export function FeatureCard({ title, description, image }: FeatureCardProps) {
  return (
    <div className="rounded-2xl bg-gray-100 p-5 text-start">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="opacity-50">{description}</p>

      {image && <div className="mt-5 h-96 rounded-sm bg-gray-200" />}
    </div>
  )
}
