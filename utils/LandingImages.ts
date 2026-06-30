'use server'

import fs from 'fs'
import path from 'path'

import { withCache } from '@/lib/cache'

interface GetLandingImages {
  imageFolder?: string
}

export async function getLandingImages({
  imageFolder = 'landing',
}: GetLandingImages = {}) {
  const cacheKey = `landing-images:${imageFolder}`

  return await withCache(cacheKey, async () => {
    const dirPath = path.join(process.cwd(), `public/images/${imageFolder}`)

    try {
      const files = fs.readdirSync(dirPath)
      const images = files.filter((file) =>
        /\.(jpeg|jpg|avif|png|svg)$/i.test(file),
      )
      return images.map((img) => `/images/${imageFolder}/${img}`)
    } catch (error) {
      console.error(error)
      return []
    }
  })
}
