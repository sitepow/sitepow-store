import { useEffect, useState } from 'react'

import { SECOND } from '@/constants/system'
import { getLandingImages } from '@/utils/LandingImages'

export function useLandingImages(intervalTime = 5 * SECOND) {
  const [images, setImages] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    getLandingImages().then(setImages)
  }, [])

  useEffect(() => {
    if (images.length === 0) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [images, intervalTime])

  return {
    currentImage: images[currentIdx],
    images,
    currentIdx,
  }
}
