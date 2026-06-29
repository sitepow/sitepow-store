'use client'

import toast from 'react-hot-toast'

import { storefrontPdpaKeys } from '@/actions/query-keys/storefront/pdpa'
import { deleteUserAccount, exportUserData } from '@/actions/storefront/pdpa'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function useExportUserData() {
  return useMutation({
    mutationFn: exportUserData,
    onSuccess: (data) => {
      downloadJson(data, `sitepow-data-${Date.now()}.json`)
      toast.success('ดาวน์โหลดข้อมูลสำเร็จแล้ว')
    },
  })
}

export function useDeleteUserAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontPdpaKeys.all })
    },
  })
}
