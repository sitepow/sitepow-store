'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import sharp, { FitEnum } from 'sharp'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export type ImagePreset =
  'product' | 'avatar' | 'logo' | 'cover' | 'slip' | 'review' | 'general'

interface PresetConfig {
  width?: number
  height?: number
  fit?: keyof FitEnum
  quality: number
}

const PRESETS: Record<ImagePreset, PresetConfig> = {
  product: { width: 1200, height: 1200, fit: 'inside', quality: 80 },
  avatar: { width: 400, height: 400, fit: 'cover', quality: 80 },
  logo: { width: 500, height: 500, fit: 'inside', quality: 85 },
  cover: { width: 1920, height: 600, fit: 'cover', quality: 80 },
  slip: { width: 1600, fit: 'inside', quality: 90 },
  review: { width: 1000, fit: 'inside', quality: 80 },
  general: { width: 1920, fit: 'inside', quality: 80 },
}

export async function r2UploadImage(
  formData: FormData,
  folder: string,
  preset: ImagePreset = 'general',
) {
  const file = formData.get('file') as File
  if (!file) {
    return { success: false }
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())
  const isVideo = file.type.startsWith('video/')
  const isAnimated = file.type === 'image/gif'

  const ext = file.name.split('.').pop() || ''
  const baseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')

  try {
    let optimizedBuffer: Buffer
    let contentType = file.type
    let extension = ext

    if (isVideo || isAnimated) {
      optimizedBuffer = inputBuffer
    } else {
      const config = PRESETS[preset] || PRESETS.general
      optimizedBuffer = await sharp(inputBuffer)
        .resize({
          width: config.width,
          height: config.height,
          fit: config.fit,
          withoutEnlargement: true,
        })
        .webp({ quality: config.quality })
        .toBuffer()

      contentType = 'image/webp'
      extension = 'webp'
    }

    const fileName = `${folder}/${Date.now()}-${baseName}.${extension}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: contentType,
      }),
    )

    return {
      success: true,
      url: `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`,
      fileName,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function r2DeleteImage(fileName: string) {
  if (!fileName) {
    return { success: false }
  }

  try {
    const key = fileName.startsWith('http')
      ? new URL(fileName).pathname.substring(1)
      : fileName

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    )
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
