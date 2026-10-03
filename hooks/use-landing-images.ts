import { useEffect, useState } from 'react'

import { SECOND } from '@/constants/system'
import { getLandingImages } from '@/utils/landing-images'

const DEFAULT_IMAGES: Record<string, string[]> = {
  'hero-section': [
    '/images/hero-section/section-1.jpeg',
    '/images/hero-section/section-2.jpeg',
    '/images/hero-section/section-3.jpeg',
    '/images/hero-section/section-4.jpeg',
    '/images/hero-section/section-5.jpeg',
  ],
  shelf: ['/images/shelf/premium_photo-1679003074247-9c70a2822cb6.avif'],
  landing: [
    '/images/landing/landing-orders-managers.jpeg',
    '/images/landing/landing-product-boxs.jpeg',
    '/images/landing/landing-pos.jpeg',
    '/images/landing/landing-inventory.jpeg',
    '/images/landing/landing-permission.jpeg',
    '/images/landing/landing-expense.jpeg',
    '/images/landing/landing-reseller.jpeg',
    '/images/landing/landing-loyalty.jpeg',
    '/images/landing/landing-customization.jpeg',
    '/images/landing/landing-payments.jpeg',
    '/images/landing/landing-ai-slip.jpeg',
    '/images/landing/landing-chat.jpeg',
    '/images/landing/landing-cloud.jpeg',
    '/images/landing/landing-security.jpeg',
  ],
}

interface LandingImages {
  intervalTime?: number
  imageFolder?: string
}

export function useLandingImages({
  intervalTime = 5 * SECOND,
  imageFolder = 'landing',
}: LandingImages = {}) {
  const initialImages = DEFAULT_IMAGES[imageFolder] || []
  const [images, setImages] = useState<string[]>(initialImages)
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (initialImages.length > 0) return
    getLandingImages({ imageFolder }).then((result) => {
      if (result && result.length > 0) {
        setImages(result)
      }
    })
  }, [imageFolder, initialImages.length])

  useEffect(() => {
    if (images.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [images.length, intervalTime])

  return {
    currentImage: images[currentIdx] || initialImages[0] || '',
    images,
    currentIdx,
  }
}
