/* eslint-disable react-hooks/immutability */
'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useSearchParams } from 'next/navigation'

import { registerUser } from '@/actions/account/auth/actions'
import { REGISTER_PROVIDERS } from '@/constants/register'
import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { RegisterFormInputs } from '@/types/register'
import { useMutation } from '@tanstack/react-query'

import { ContentDivider } from '@/components/ContentDivider'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth/client'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as UserRole
  const currentRole = roleParam || UserRole.MERCHANT
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const { currentImage } = useLandingImages()

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

  const passwordValue = watch('password')

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

  return (
    <main
      id="main-content"
      className="text-foreground container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 sm:p-10 lg:max-w-7xl"
    >
      <div className="border-border bg-background sm:shadow-airy flex w-full overflow-hidden rounded-3xl border">
        <div
          style={{
            backgroundImage: currentImage ? `url('${currentImage}')` : 'none',
          }}
          className="relative hidden w-1/2 bg-cover bg-center lg:block"
        >
          <div className="absolute bottom-6 left-6 z-10 bg-black/20 p-3 backdrop-blur-md">
            <LogoBrand className="text-white" />
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-6 p-6 sm:p-10 md:p-12 lg:w-1/2 dark:bg-neutral-800">
          <SectionHeader
            className="text-center"
            title={
              currentRole !== UserRole.CUSTOMER
                ? 'สมัครเปิดร้านค้าของคุณ'
                : 'สมัครสมาชิกสั่งซื้อสินค้า'
            }
          />
          <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col gap-3">
              {REGISTER_PROVIDERS.map((provider, idx) => (
                <SSOButton
                  key={idx}
                  onClick={() => handleSSO(provider.id)}
                  {...provider}
                />
              ))}
            </div>
            <ContentDivider name="หรือสมัครด้วยอีเมล" />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <Field>
                <FieldLabel>อีเมล (E-mail)</FieldLabel>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 rounded-xl"
                  {...register('email', {
                    required: 'กรุณาระบุอีเมลของคุณ',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'รูปแบบอีเมลไม่ถูกต้อง',
                    },
                  })}
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  ใช้อีเมลจริงเพื่อรับรหัสยืนยัน OTP
                </FieldDescription>
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>รหัสผ่าน</FieldLabel>
                <Input
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="h-11 rounded-xl"
                  {...register('password', {
                    required: 'กรุณากำหนดรหัสผ่าน',
                    minLength: {
                      value: 6,
                      message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                    },
                  })}
                />
                <FieldError>{errors?.password?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>ยืนยันรหัสผ่าน</FieldLabel>
                <Input
                  type="password"
                  placeholder="ระบุรหัสผ่านใหม่อีกครั้ง"
                  className="h-11 rounded-xl"
                  {...register('confirmPassword', {
                    required: 'กรุณายืนยันรหัสผ่าน',
                    validate: (value) =>
                      value === passwordValue || 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
                  })}
                />
                <FieldError>{errors?.confirmPassword?.message}</FieldError>
              </Field>
              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl text-base font-medium"
                size="lg"
                disabled={isPending}
              >
                {isPending && <Spinner className="mr-2" />}
                สมัครสมาชิก
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-sm">
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
    </main>
  )
}
