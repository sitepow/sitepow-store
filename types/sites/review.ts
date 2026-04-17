export interface ReviewCategory {
  label: string
  rating: number
}

export interface Review {
  reviewId: string
  user: string
  avatar?: string
  rating: number
  categories: ReviewCategory[]
  date: string
  comment: string
  images: string[]
  video: string | null
  variantId: string
  variantTitle: string
  sku: string
  selectedOptions?: {
    title: string
    name: string
  }[]
}
