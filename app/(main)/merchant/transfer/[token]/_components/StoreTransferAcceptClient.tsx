'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  useAcceptTransferRequest,
  useDeclineTransferRequest,
  useTransferRequestByToken,
} from '@/actions/store/ownership-transfer/hooks'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconClockHour4,
  IconExternalLink,
  IconLogout,
  IconReplace,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

import { signOut } from '@/lib/auth/client'

interface StoreTransferAcceptClientProps {
  token: string
}

export function StoreTransferAcceptClient({
  token,
}: StoreTransferAcceptClientProps) {
  const router = useRouter()
  const { setSelectedStoreId, setSelectedStoreSlug } = useStoreFilter()

  const { data: res, isLoading } = useTransferRequestByToken(token)
  const acceptMutation = useAcceptTransferRequest()
  const declineMutation = useDeclineTransferRequest()

  const [acceptedSuccess, setAcceptedSuccess] = useState(false)
  const [acceptedStore, setAcceptedStore] = useState<{
    id: string
    name: string
    slug: string
  } | null>(null)

  const transfer = res?.success ? res.data : null

  const handleAccept = () => {
    if (!transfer?.currentUser?.id) return

    acceptMutation.mutate(
      { token, userId: transfer.currentUser.id },
      {
        onSuccess: (result) => {
          if (result.success && result.data) {
            setSelectedStoreId(result.data.storeId)
            setSelectedStoreSlug(result.data.storeSlug)
            setAcceptedStore({
              id: result.data.storeId,
              name: result.data.storeName,
              slug: result.data.storeSlug,
            })
            setAcceptedSuccess(true)
          }
        },
      },
    )
  }

  const handleDecline = () => {
    if (!transfer?.currentUser?.id) return

    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอรับโอนสิทธิ์ร้านค้านี้?')) {
      declineMutation.mutate({ token, userId: transfer.currentUser.id })
    }
  }

  const handleGoToDashboard = (storeId?: string, storeSlug?: string) => {
    if (storeId) setSelectedStoreId(storeId)
    if (storeSlug) setSelectedStoreSlug(storeSlug)
    router.push('/merchant/dashboard')
  }

  const handleSwitchAccount = async () => {
    await signOut()
    const currentPath = window.location.pathname
    router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border p-8 text-center shadow-md">
          <div className="flex flex-col items-center justify-center gap-3">
            <Spinner className="text-primary h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              กำลังโหลดข้อมูลคำขอโอนร้านค้า...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Not found or invalid token
  if (!res?.success || !transfer) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border text-center shadow-md">
          <CardHeader>
            <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <IconAlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              ไม่พบคำขอโอนร้านค้า
            </CardTitle>
            <CardDescription className="text-xs">
              {res?.message || 'ลิงก์คำขออาจไม่ถูกต้องหรือถูกลบไปแล้ว'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/merchant/dashboard')}
            >
              ไปยังหน้าแดชบอร์ด
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Success view (after accepting or if already accepted)
  if (acceptedSuccess || transfer.status === 'ACCEPTED') {
    const storeName = acceptedStore?.name || transfer.store.name
    const storeId = acceptedStore?.id || transfer.store.id
    const storeSlug = acceptedStore?.slug || transfer.store.slug

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg border text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <IconCheck className="h-8 w-8 stroke-[2.5]" />
            </div>
            <CardTitle className="text-foreground mt-2 text-xl font-bold">
              โอนสิทธิ์ร้านค้าสำเร็จ!
            </CardTitle>
            <CardDescription className="text-xs">
              ยินดีด้วย บัญชีของคุณได้รับการแต่งตั้งเป็นเจ้าของร้านค้า (Owner)
              เรียบร้อยแล้ว
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted/30 flex items-center justify-center gap-3 rounded-xl border p-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={transfer.store.logo || ''} alt={storeName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {storeName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h3 className="text-foreground text-sm font-semibold">
                  {storeName}
                </h3>
                <span className="text-muted-foreground font-mono text-xs">
                  {storeSlug}
                </span>
              </div>
            </div>

            <div className="bg-muted/40 space-y-1.5 rounded-lg border p-3.5 text-left text-xs">
              <div className="text-foreground flex items-center gap-1.5 font-semibold">
                <IconShieldCheck className="h-4 w-4 text-emerald-600" />
                สิทธิ์ที่คุณได้รับในฐานะเจ้าของร้าน:
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 pl-1 text-[11px]">
                <li>
                  เข้าถึงและบริหารจัดการร้านค้า สต็อกสินค้า
                  และคำสั่งซื้อได้เต็มรูปแบบ
                </li>
                <li>ตั้งค่าช่องทางชำระเงิน การขนส่ง และ Webhook อัตโนมัติ</li>
                <li>จัดการทีมงานและกำหนดสิทธิ์พนักงานภายในร้าน</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <Button
              className="gap-2 px-6"
              onClick={() => handleGoToDashboard(storeId, storeSlug)}
            >
              เข้าสู่แดชบอร์ดร้านค้าทันที <IconArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Expired state
  if (transfer.status === 'EXPIRED') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border text-center shadow-md">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <IconClock className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              คำขอโอนร้านค้านี้หมดอายุแล้ว
            </CardTitle>
            <CardDescription className="text-xs">
              คำขอโอนย้ายสิทธิ์มีอายุ 24 ชั่วโมง และหมดเวลาใช้งานแล้ว
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            กรุณาติดต่อเจ้าของร้านเดิม{' '}
            <span className="text-foreground font-semibold">
              {transfer.fromOwner?.name || transfer.fromOwner?.email}
            </span>{' '}
            เพื่อให้ส่งคำขอโอนร้านค้าใหม่อีกครั้ง
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/merchant/dashboard')}
            >
              กลับสู่หน้าแดชบอร์ด
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Cancelled or Declined state
  if (transfer.status === 'CANCELLED' || transfer.status === 'DECLINED') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border text-center shadow-md">
          <CardHeader>
            <div className="bg-muted text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <IconX className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              คำขอโอนร้านค้านี้ถูกยกเลิกแล้ว
            </CardTitle>
            <CardDescription className="text-xs">
              คำขอนี้ถูกยกเลิกโดยเจ้าของร้าน หรือถูกปฏิเสธไปแล้ว
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/merchant/dashboard')}
            >
              กลับสู่หน้าแดชบอร์ด
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Not logged in
  if (!transfer.currentUser) {
    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : ''
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border text-center shadow-md">
          <CardHeader>
            <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <IconReplace className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              คำขอโอนสิทธิ์ร้านค้า {transfer.store.name}
            </CardTitle>
            <CardDescription className="text-xs">
              กรุณาเข้าสู่ระบบด้วยอีเมล{' '}
              <span className="text-foreground font-semibold">
                {transfer.toEmail}
              </span>{' '}
              เพื่อดำเนินการรับโอนร้านค้า
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/login?callbackUrl=${encodeURIComponent(currentPath)}`,
                )
              }
            >
              เข้าสู่ระบบเพื่อรับโอนร้านค้า
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Logged in with wrong account
  if (!transfer.isRecipient) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border text-center shadow-md">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <IconAlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">
              บัญชีไม่ตรงกับผู้รับคำขอ
            </CardTitle>
            <CardDescription className="text-xs">
              คำขอนี้ส่งถึงอีเมล{' '}
              <span className="text-foreground font-bold">
                {transfer.toEmail}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-xs">
            <p>
              ปัจจุบันคุณเข้าสู่ระบบด้วยบัญชี:{' '}
              <span className="text-foreground font-semibold">
                {transfer.currentUser.email}
              </span>
            </p>
            <p>
              กรุณาสลับบัญชีหรือเข้าสู่ระบบใหม่ด้วยอีเมล{' '}
              <span className="text-foreground font-semibold">
                {transfer.toEmail}
              </span>{' '}
              เพื่อยอมรับการรับโอนร้านค้า
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleSwitchAccount}
            >
              <IconLogout className="h-3.5 w-3.5" /> สลับบัญชีผู้ใช้
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Active PENDING state & Recipient verified
  const isPendingAction = acceptMutation.isPending || declineMutation.isPending

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg border shadow-lg">
        <CardHeader className="pb-4 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <IconReplace className="h-6 w-6" />
          </div>
          <CardTitle className="mt-2 text-xl font-bold">
            คำขอโอนย้ายความเป็นเจ้าของร้านค้า
          </CardTitle>
          <CardDescription className="text-xs">
            คุณได้รับคำขอโอนกรรมสิทธิ์ร้านค้าจากเจ้าของเดิม
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Store Preview */}
          <div className="bg-muted/30 flex items-center gap-4 rounded-xl border p-4">
            <Avatar className="h-14 w-14 border shadow-xs">
              <AvatarImage
                src={transfer.store.logo || ''}
                alt={transfer.store.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {transfer.store.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-base font-bold">
                  {transfer.store.name}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  พร้อมโอนสิทธิ์
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono text-xs">
                slug: {transfer.store.slug}
              </p>
            </div>
          </div>

          {/* Transfer Info Breakdown */}
          <div className="bg-muted/20 space-y-2.5 rounded-lg border p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">เจ้าของเดิม:</span>
              <span className="text-foreground font-medium">
                {transfer.fromOwner?.name || 'ไม่ระบุชื่อ'} (
                {transfer.fromOwner?.email})
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ผู้รับโอนสิทธิ์:</span>
              <span className="text-primary font-mono font-semibold">
                {transfer.toEmail}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">วันที่ส่งคำขอ:</span>
              <span className="text-muted-foreground">
                {formatDateTime(transfer.createdAt)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <IconClockHour4 className="h-3.5 w-3.5 text-amber-600" />
                หมดอายุภายใน:
              </span>
              <span className="text-foreground font-medium">
                {formatDateTime(transfer.expiresAt)}
              </span>
            </div>
          </div>

          {/* Terms & Warning */}
          <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs dark:bg-amber-500/10">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              ข้อควรทราบก่อนยืนยัน:
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              เมื่อกดยืนยัน สิทธิ์ขาดในการบริหารร้านค้า สถิติ คำสั่งซื้อ รายได้
              และการตั้งค่าระบบทั้งหมดจะถูกเปลี่ยนมาเป็นบัญชีของคุณโดยสมบูรณ์
              และเจ้าของเดิมจะไม่มีสิทธิ์ความเป็นเจ้าของร้านนี้อีกต่อไป
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full text-xs sm:w-auto"
            disabled={isPendingAction}
            onClick={handleDecline}
          >
            {declineMutation.isPending ? 'กำลังปฏิเสธ...' : 'ปฏิเสธคำขอ'}
          </Button>

          <Button
            size="sm"
            className="w-full gap-2 text-xs sm:w-auto"
            disabled={isPendingAction}
            onClick={handleAccept}
          >
            {acceptMutation.isPending ? (
              <>
                <Spinner className="h-3.5 w-3.5" /> กำลังดำเนินการโอนร้านค้า...
              </>
            ) : (
              <>
                <IconCheck className="h-3.5 w-3.5" /> ยอมรับการรับโอนสิทธิ์
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
