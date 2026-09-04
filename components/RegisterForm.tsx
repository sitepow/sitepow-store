/* eslint-disable react-hooks/immutability */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useSearchParams } from 'next/navigation'

import { registerUser } from '@/actions/auth'
import { REGISTER_PROVIDERS } from '@/constants/register'
import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { RegisterFormInputs } from '@/types/register'
import { useMutation } from '@tanstack/react-query'
import {
  CheckCircle2Icon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SparklesIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react'

import { ContentDivider } from '@/components/ContentDivider'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth-client'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as UserRole
  const currentRole = roleParam || UserRole.MERCHANT
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const { currentImage, images, currentIdx } = useLandingImages()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loginParams = new URLSearchParams()
  if (roleParam) {
    loginParams.set('role', roleParam)
  }

  if (callbackUrl && callbackUrl !== '/') {
    loginParams.set('callbackUrl', callbackUrl)
  }

  const loginHref = `/login${loginParams.toString() ? `?${loginParams.toString()}` : ''}`

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = watch('password') || ''
  const confirmPasswordValue = watch('confirmPassword') || ''

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: async (res, variables) => {
      if (res && !res.success) {
        toast.error(res.message || 'การลงทะเบียนล้มเหลว')
        return
      }

      toast.success(res?.message || 'สมัครสมาชิกสำเร็จ!')

      const response = await authClient.signIn.email({
        email: variables.email,
        password: variables.password,
      })

      if (response.error) {
        toast.error('เข้าสู่ระบบอัตโนมัติติดขัด กรุณาเข้าสู่ระบบอีกครั้ง')
        window.location.href = loginHref
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

  const onSubmit = (data: RegisterFormInputs) => {
    mutate({ ...data, userRole: currentRole })
  }

  const isCustomer = currentRole === UserRole.CUSTOMER
  const isPasswordLongEnough = passwordValue.length >= 6
  const isPasswordMatching =
    confirmPasswordValue.length > 0 && confirmPasswordValue === passwordValue

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
                    ? 'สมัครสมาชิกง่าย ใช้งานได้ทันที'
                    : 'เริ่มต้นธุรกิจออนไลน์ได้ใน 5 นาที'}
                </span>
              </div>
              <h2 className="text-2xl leading-snug font-bold tracking-tight text-white sm:text-3xl">
                {isCustomer
                  ? 'เปิดประสบการณ์การช้อปปิ้งที่สะดวกและปลอดภัย'
                  : 'สร้างร้านค้าและระบบขายของออนไลน์ครบวงจร'}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-white/80">
              {isCustomer ? (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>สมัครสมาชิกฟรี ไม่มีค่าใช้จ่ายแอบแฝง</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>บันทึกที่อยู่จัดส่งและช้อปปิ้งได้อย่างรวดเร็ว</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>รับสิทธิพิเศษและโปรโมชันเฉพาะสมาชิก</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>
                      มีหน้าร้านค้าออนไลน์ส่วนตัว พร้อมระบบตะกร้าสินค้า
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>ระบบคำนวณค่าส่งและพิมพ์ใบปะหน้าพัสดุอัตโนมัติ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-emerald-400" />
                    <span>เชื่อมต่อระบบแจ้งเตือนและชำระเงินได้ทันที</span>
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
                    <span>สมัครเปิดร้านค้า (Merchant)</span>
                  </>
                )}
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {isCustomer
                  ? 'สมัครสมาชิกสั่งซื้อสินค้า'
                  : 'สมัครเปิดร้านค้าของคุณ'}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {isCustomer
                  ? 'สร้างบัญชีผู้ใช้งานเพื่อสั่งซื้อสินค้าและติดตามคำสั่งซื้อ'
                  : 'เริ่มต้นธุรกิจออนไลน์และจัดการระบบหลังบ้านได้ทันที'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {REGISTER_PROVIDERS.map((provider, idx) => (
                <SSOButton
                  key={idx}
                  onClick={() => handleSSO(provider.id)}
                  {...provider}
                />
              ))}
            </div>
            <ContentDivider name="หรือสมัครด้วยอีเมล" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
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
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'รูปแบบอีเมลไม่ถูกต้อง',
                      },
                    })}
                  />
                </div>
                <p className="text-muted-foreground text-[11px]">
                  ใช้อีเมลจริงเพื่อรับรหัสยืนยัน OTP ในกรณีลืมรหัสผ่าน
                </p>
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium">
                  รหัสผ่าน (Password)
                </FieldLabel>
                <div className="relative">
                  <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="h-11 rounded-xl pr-10 pl-10 text-sm"
                    {...register('password', {
                      required: 'กรุณากำหนดรหัสผ่าน',
                      minLength: {
                        value: 6,
                        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                      },
                    })}
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
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 transition-colors ${
                      isPasswordLongEnough
                        ? 'font-medium text-emerald-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <CheckIcon className="size-3" /> อย่างน้อย 6 ตัวอักษร
                  </span>
                </div>
                <FieldError>{errors?.password?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium">
                  ยืนยันรหัสผ่าน (Confirm Password)
                </FieldLabel>
                <div className="relative">
                  <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="ระบุรหัสผ่านใหม่อีกครั้ง"
                    className="h-11 rounded-xl pr-10 pl-10 text-sm"
                    {...register('confirmPassword', {
                      required: 'กรุณายืนยันรหัสผ่าน',
                      validate: (value) =>
                        value === passwordValue ||
                        'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                    aria-label={
                      showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordValue.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 transition-colors ${
                        isPasswordMatching
                          ? 'font-medium text-emerald-500'
                          : 'text-destructive font-medium'
                      }`}
                    >
                      <CheckIcon className="size-3" />
                      {isPasswordMatching
                        ? 'รหัสผ่านตรงกัน'
                        : 'รหัสผ่านยังไม่ตรงกัน'}
                    </span>
                  </div>
                )}
                <FieldError>{errors?.confirmPassword?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                className="shadow-primary/20 hover:shadow-primary/25 mt-1 h-11 w-full cursor-pointer rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.99]"
                size="lg"
                disabled={isPending}
              >
                {isPending && <Spinner className="mr-2" />}
                {isPending ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
              <a
                href={loginHref}
                className="text-primary font-semibold transition-all hover:underline"
              >
                เข้าสู่ระบบที่นี่
              </a>
            </p>
          </div>
        </div>
      </div>
      {currentRole !== UserRole.CUSTOMER && <SupportContact />}
      {currentRole === UserRole.CUSTOMER && <ProtectedByBrand />}
    </div>
  )
}
