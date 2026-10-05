import toast from 'react-hot-toast'

import {
  acceptTransferRequest,
  cancelTransferRequest,
  createTransferRequest,
  declineTransferRequest,
  getTransferRequestByToken,
  getTransferRequests,
  resendTransferEmail,
} from '@/actions/store/ownership-transfer/actions'
import { storeTransferKeys } from '@/actions/store/ownership-transfer/query-keys'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useTransferRequests(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: storeTransferKeys.list(storeId),
      queryFn: async () => await getTransferRequests(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useTransferRequestByToken(token: string) {
  return useQuery(
    queryOptions({
      queryKey: storeTransferKeys.byToken(token),
      queryFn: async () => await getTransferRequestByToken(token),
      enabled: !!token,
    }),
  )
}

export function useCreateTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      fromOwnerId,
      toEmail,
    }: {
      storeId: string
      fromOwnerId: string
      toEmail: string
    }) => await createTransferRequest(storeId, fromOwnerId, toEmail),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'ส่งคำขอโอนร้านค้าสำเร็จ')
        queryClient.invalidateQueries({ queryKey: storeTransferKeys.all })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการส่งคำขอโอน')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งคำขอโอน',
      )
    },
  })
}

export function useCancelTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      ownerId,
    }: {
      requestId: string
      ownerId: string
    }) => await cancelTransferRequest(requestId, ownerId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'ยกเลิกคำขอโอนสำเร็จ')
        queryClient.invalidateQueries({ queryKey: storeTransferKeys.all })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการยกเลิกคำขอโอน')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิกคำขอโอน',
      )
    },
  })
}

export function useAcceptTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token, userId }: { token: string; userId: string }) =>
      await acceptTransferRequest(token, userId),
    onSuccess: (res, vars) => {
      if (res.success) {
        toast.success(res.message || 'รับโอนร้านค้าสำเร็จ')
        queryClient.invalidateQueries({
          queryKey: storeTransferKeys.byToken(vars.token),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการรับโอนร้านค้า')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรับโอนร้านค้า',
      )
    },
  })
}

export function useDeclineTransferRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token, userId }: { token: string; userId: string }) =>
      await declineTransferRequest(token, userId),
    onSuccess: (res, vars) => {
      if (res.success) {
        toast.success(res.message || 'ปฏิเสธคำขอโอนสำเร็จ')
        queryClient.invalidateQueries({
          queryKey: storeTransferKeys.byToken(vars.token),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอโอน')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธคำขอโอน',
      )
    },
  })
}

export function useResendTransferEmail() {
  return useMutation({
    mutationFn: async ({
      requestId,
      ownerId,
    }: {
      requestId: string
      ownerId: string
    }) => await resendTransferEmail(requestId, ownerId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'ส่งอีเมลอีกครั้งสำเร็จ')
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการส่งอีเมล')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งอีเมล',
      )
    },
  })
}
