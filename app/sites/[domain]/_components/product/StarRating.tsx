import { StarIcon } from 'lucide-react'

export function StarRating({
  rating,
  size = 12,
}: {
  rating: number
  size?: number
}) {
  return (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          size={size}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}
