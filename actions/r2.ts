'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function r2UploadImage(formData: FormData, folder: string) {
  const file = formData.get('file') as File
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${folder}/${Date.now()}-${file.name}`

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    )

    return {
      success: true,
      url: `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`,
    }
  } catch {
    return { success: false }
  }
}

export async function r2DeleteImage(fileName: string) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
      }),
    )
    return { success: true }
  } catch {
    return { success: false }
  }
}
