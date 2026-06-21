'use server'

import fs from 'fs'
import path from 'path'

export async function getLandingImages() {
  const dirPath = path.join(process.cwd(), 'public/images/landing')

  try {
    const files = fs.readdirSync(dirPath)

    const images = files.filter((file) => /\.(jpeg|jpg|png|svg)$/i.test(file))

    return images.map((img) => `/images/landing/${img}`)
  } catch (error) {
    console.error(error)
    return []
  }
}
