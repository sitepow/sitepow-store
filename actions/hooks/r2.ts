import { useMutation } from '@tanstack/react-query'

import { r2DeleteImage, r2UploadImage } from '../r2'

export function useR2UploadImage(foder: string) {
  return useMutation({
    mutationFn: async (formData: FormData) =>
      await r2UploadImage(formData, foder),
  })
}

export function useR2DeleteImage() {
  return useMutation({
    mutationFn: async (fileName: string) => await r2DeleteImage(fileName),
  })
}
