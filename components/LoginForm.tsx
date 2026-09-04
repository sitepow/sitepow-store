'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useSearchParams } from 'next/navigation'

import { LOGIN_PROVIDERS } from '@/constants/login'
import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { LoginFormInputs } from '@/types/login'
import { useMutation } from '@tanstack/react-query'
import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SparklesIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react'

import { ContentDivider } from '@/components/ContentDivider'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordForm'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth-client'

export function LoginForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as UserRole
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const { currentImage, images, currentIdx } = useLandingImages()
  const [showPassword, setShowPassword] = useState(false)

  const registerParams = new URLSearchParams()
  if (role) {
    registerParams.set('role', role)
  }

  if (callbackUrl && callbackUrl !== '/') {
    registerParams.set('callbackUrl', callbackUrl)
  }

  const registerHref = `/register${registerParams.toString() ? `?${registerParams.toString()}` : ''}`

  useEffect(() => {
    const autoProvider = searchParams.get('sso_provider')
    const returnTo = searchParams.get('returnTo')

    if (autoProvider && returnTo) {
      const centralCallback = `https://sitepow.store/api/auth/sso-callback?returnTo=${encodeURIComponent(returnTo)}`

      authClient.signIn.social({
        provider: autoProvider as 'google' | 'line',
        callbackURL: centralCallback,
      })
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, password }: LoginFormInputs) => {
      return await authClient.signIn.email({
        email,
        password,
      })
    },
    onSuccess: (response) => {
      if (response.error) {
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        return
      }

      window.location.href = callbackUrl
    },
  })

  const handleSSO = async (providerId: string) => {
    try {
      const currentOrigin =
        typeof window !== 'undefined' ? window.location.origin : ''
      const targetPath = callbackUrl.startsWith('/')
        ? callbackUrl
        : `/${callbackUrl}`
      const returnTo = `${currentOrigin}${targetPath}`

      const isCentralDomain =
        window.location.hostname.endsWith('sitepow.store') ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === 'lvh.me'

      if (!isCentralDomain) {
        const centralSsoUrl = new URL(
          'https://sitepow.store/api/auth/sso-callback',
        )
        centralSsoUrl.searchParams.set('returnTo', returnTo)
        centralSsoUrl.searchParams.set('provider', providerId)

        window.location.href = centralSsoUrl.toString()
        return
      }

      const centralCallback = `https://sitepow.store/api/auth/sso-callback?returnTo=${encodeURIComponent(returnTo)}`

      await authClient.signIn.social({
        provider: providerId as 'google' | 'line',
        callbackURL: centralCallback,
      })
    } catch (err) {
      console.error(err)
      toast.error('ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้')
    }
  }

  const onSubmit = (data: LoginFormInputs) => {
    mutate(data)
  }

  const isCustomer = role === UserRole.CUSTOMER

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 p-4 sm:p-6 lg:max-w-6xl lg:p-10">
      <div className="border-border/80 bg-card text-card-foreground flex w-full overflow-hidden rounded-3xl border shadow-xl shadow-black/[0.03] dark:shadow-black/20">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-10 text-white lg:flex">
          {currentImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url('${currentImage}')` }}
            />
          ) : (
            <div className="from-primary/20 absolute inset-0 bg-gradient-to-br via-neutral-950 to-neutral-900" />
          )}
          <div className="bg-primary/25 pointer-events-none absolute -top-20 -left-20 size-72 rounded-full blur-3xl" />
          <div className="bg-primary/20 pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full blur-3xl" />
          <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
              <LogoBrand className="text-base font-semibold text-white" />
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <div className="bg-primary/20 text-primary-foreground border-primary/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-xs">
                <SparklesIcon className="text-primary size-3" />
                <span>
                  {isCustomer
                    ? 'ช้อปปิ้งมั่นใจ ปลอดภัย 100%'
                    : 'แพลตฟอร์มเปิดร้านค้าครบวงจร'}
                </span>
              </div>
              <h2 className="text-2xl leading-snug font-bold tracking-tight text-white sm:text-3xl">
                {isCustomer
                  ? 'เลือกช้อปสินค้าคุณภาพ จากร้านค้าที่ไว้ใจได้'
                  : 'บริหารและขยายธุรกิจของคุณ ให้เติบโตอย่างมั่นคง'}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-white/80">
              {isCustomer ? (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>เลือกซื้อสินค้าหลากหลาย พร้อมโปรโมชันสุดคุ้ม</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>ติดตามสถานะพัสดุและคำสั่งซื้อได้เรียลไทม์</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>ระบบชำระเงินปลอดภัย รองรับหลายช่องทาง</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>จัดการสินค้า สต็อก และออเดอร์ในหน้าจอเดียว</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>ระบบชำระเงิน ตรวจสอบสลิป และแจ้งเตือนอัตโนมัติ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>สถิติยอดขายและข้อมูลเชิงลึกแบบเรียลไทม์</span>
                  </li>
                </>
              )}
            </ul>
            {images.length > 1 && (
              <div className="flex items-center gap-1.5 pt-2">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col justify-center p-6 sm:p-10 md:p-12 lg:w-1/2">
          <div className="mb-4 flex justify-center lg:hidden">
            <LogoBrand className="text-xl" />
          </div>
          <div className="mx-auto w-full max-w-sm space-y-6">
            {/* Header with Role Badge */}
            <div className="space-y-2 text-center">
              <div className="bg-muted/80 text-muted-foreground border-border/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                {isCustomer ? (
                  <>
                    <UserIcon className="text-primary size-3" />
                    <span>ระบบสำหรับลูกค้า (Customer)</span>
                  </>
                ) : (
                  <>
                    <StoreIcon className="text-primary size-3" />
                    <span>ระบบจัดการร้านค้า (Merchant)</span>
                  </>
                )}
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                เข้าสู่ระบบ
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {isCustomer
                  ? 'เข้าสู่ระบบเพื่อเริ่มสั่งซื้อสินค้าและติดตามสถานะ'
                  : 'เข้าสู่ระบบเพื่อจัดการร้านค้าและระบบหลังบ้าน'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOGIN_PROVIDERS.map((provider, idx) => (
                <SSOButton
                  key={idx}
                  onClick={() => handleSSO(provider.id)}
                  {...provider}
                />
              ))}
            </div>
            <ContentDivider name="หรือเข้าสู่ระบบด้วยอีเมล" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field>
                <FieldLabel className="text-xs font-medium">
                  อีเมล (E-mail)
                </FieldLabel>
                <div className="relative">
                  <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 rounded-xl pl-10 text-sm"
                    {...register('email', {
                      required: 'กรุณาระบุอีเมลของคุณ',
                    })}
                  />
                </div>
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-xs font-medium">
                    รหัสผ่าน (Password)
                  </FieldLabel>
                  <ForgotPasswordDialog />
                </div>
                <div className="relative">
                  <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 rounded-xl pr-10 pl-10 text-sm"
                    {...register('password', { required: 'กรุณาระบุรหัสผ่าน' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError>{errors?.password?.message}</FieldError>
              </Field>
              <Button
                type="submit"
                className="shadow-primary/20 hover:shadow-primary/25 h-11 w-full cursor-pointer rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.99]"
                size="lg"
                disabled={isPending}
              >
                {isPending && <Spinner className="mr-2" />}
                {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              ยังไม่มีบัญชีผู้ใช้งาน?{' '}
              <a
                href={registerHref}
                className="text-primary font-semibold transition-all hover:underline"
              >
                สมัครสมาชิกฟรี
              </a>
            </p>
          </div>
        </div>
      </div>
      {!isCustomer && <SupportContact />}
      {isCustomer && <ProtectedByBrand />}
    </div>
  )
}
