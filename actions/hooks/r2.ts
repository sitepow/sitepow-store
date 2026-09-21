import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'

import { getR2PresignedUrl, r2DeleteImage } from '../r2'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
}

function getFallbackContentType(file: File): string {
  if (file.type) return file.type

  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'mov':
      return 'video/quicktime'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

export function useR2UploadImage(folder: string) {
  return useMutation({
    mutationFn: async (input: File | FormData) => {
      let file: File | null = null

      if (input instanceof FormData) {
        file = input.get('file') as File
      } else if (input instanceof File) {
        file = input
      }

      if (!file) {
        throw new Error('ไม่พบไฟล์ที่ต้องการอัปโหลด')
      }

      let fileToUpload = file
      const contentType = getFallbackContentType(file)
      const isVideo = contentType.startsWith('video/')
      const isGif = contentType === 'image/gif'
      const isImage = contentType.startsWith('image/')

      if (isImage && !isGif && !isVideo) {
        try {
          const compressedBlob = await imageCompression(
            file,
            COMPRESSION_OPTIONS,
          )

          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          fileToUpload = new File([compressedBlob], cleanName, {
            type: 'image/webp',
          })
        } catch (compressErr) {
          console.warn(compressErr)
        }
      }

      const finalContentType = fileToUpload.type || contentType

      const presigned = await getR2PresignedUrl(
        fileToUpload.name,
        finalContentType,
        folder,
      )

      if (!presigned.success || !presigned.uploadUrl) {
        throw new Error('ไม่สามารถสร้าง Upload URL ได้')
      }

      const res = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': finalContentType,
        },
        body: fileToUpload,
      })

      if (!res.ok) {
        throw new Error('อัปโหลดไฟล์ไปยัง R2 ไม่สำเร็จ')
      }

      return {
        success: true,
        url: presigned.publicUrl,
        fileKey: presigned.fileKey,
      }
    },
  })
}

export function useR2DeleteImage() {
  return useMutation({
    mutationFn: async (fileName: string) => await r2DeleteImage(fileName),
  })
}
