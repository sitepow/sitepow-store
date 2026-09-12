'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function getR2PresignedUrl(
  fileName: string,
  contentType: string,
  folder: string,
) {
  try {
    const ext = fileName.split('.').pop() || ''
    const baseName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')

    const key = `${folder}/${Date.now()}-${baseName}.${ext}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    // @ts-ignore
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

    return {
      success: true,
      uploadUrl,
      fileKey: key,
      publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${key}`,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function r2DeleteImage(fileName: string) {
  if (!fileName) return { success: false }

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

export async function uploadExternalUrlToR2(
  imageUrl: string,
  folder: string,
): Promise<{ success: boolean; url: string }> {
  try {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN
    // If it's already an R2 URL on our domain, no need to re-upload
    if (publicDomain && imageUrl.startsWith(publicDomain)) {
      return { success: true, url: imageUrl }
    }

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })

    if (!res.ok) {
      return { success: false, url: imageUrl }
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let ext = 'jpg'
    if (contentType.includes('webp')) ext = 'webp'
    else if (contentType.includes('png')) ext = 'png'
    else if (contentType.includes('gif')) ext = 'gif'
    else if (contentType.includes('mp4')) ext = 'mp4'

    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    )

    return {
      success: true,
      url: `${process.env.R2_PUBLIC_DOMAIN}/${key}`,
    }
  } catch (error) {
    console.error('Failed to upload external URL to R2:', imageUrl, error)
    return { success: false, url: imageUrl }
  }
}

export async function uploadMultipleExternalUrlsToR2(
  imageUrls: string[],
  folder: string,
): Promise<string[]> {
  const uploadPromises = imageUrls.map(async (url) => {
    const result = await uploadExternalUrlToR2(url, folder)
    return result.url
  })
  return await Promise.all(uploadPromises)
}
