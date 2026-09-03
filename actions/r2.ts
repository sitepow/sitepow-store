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
