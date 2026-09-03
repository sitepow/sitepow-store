'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useSearchParams } from 'next/navigation'

import { LOGIN_PROVIDERS } from '@/constants/login'
import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { LoginFormInputs } from '@/types/login'
import { useMutation } from '@tanstack/react-query'

import { ContentDivider } from '@/components/ContentDivider'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordForm'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
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

  const { currentImage } = useLandingImages()

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

      const oauthUrl = new URL(
        `/api/auth/sign-in/social`,
        'https://sitepow.store',
      )
      oauthUrl.searchParams.set('provider', autoProvider)
      oauthUrl.searchParams.set('callbackURL', centralCallback)

      window.location.href = oauthUrl.toString()
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
        const centralLoginUrl = new URL('https://sitepow.store/login')
        centralLoginUrl.searchParams.set('sso_provider', providerId)
        centralLoginUrl.searchParams.set('returnTo', returnTo)

        window.location.href = centralLoginUrl.toString()
        return
      }

      const centralCallback = `https://sitepow.store/api/auth/sso-callback?returnTo=${encodeURIComponent(returnTo)}`

      const oauthUrl = new URL(
        '/api/auth/sign-in/social',
        'https://sitepow.store',
      )
      oauthUrl.searchParams.set('provider', providerId)
      oauthUrl.searchParams.set('callbackURL', centralCallback)

      window.location.href = oauthUrl.toString()
    } catch (err) {
      console.error(err)
      toast.error('ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้')
    }
  }

  const onSubmit = (data: LoginFormInputs) => {
    mutate(data)
  }

  return (
    <div className="text-foreground container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 sm:p-10 lg:max-w-7xl">
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
            title="เข้าสู่ระบบ"
            description={
              role !== UserRole.CUSTOMER
                ? 'จัดการร้านค้าและระบบหลังบ้านของคุณ'
                : 'เข้าสู่ระบบเพื่อเริ่มสั่งซื้อสินค้า'
            }
          />
          <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col gap-3">
              {LOGIN_PROVIDERS.map((provider, idx) => (
                <SSOButton
                  key={idx}
                  onClick={() => handleSSO(provider.id)}
                  {...provider}
                />
              ))}
            </div>
            <ContentDivider name="หรือเข้าสู่ระบบด้วยอีเมล" />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Field>
                <FieldLabel>อีเมล (E-mail)</FieldLabel>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 rounded-xl"
                  {...register('email', {
                    required: 'กรุณาระบุอีเมลของคุณ',
                  })}
                />
                <FieldError>{errors?.email?.message}</FieldError>
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>รหัสผ่าน</FieldLabel>
                  <ForgotPasswordDialog />
                </div>
                <Input
                  type="password"
                  placeholder="ระบุรหัสผ่าน"
                  className="h-11 rounded-xl"
                  {...register('password', { required: 'กรุณาระบุรหัสผ่าน' })}
                />
                <FieldError>{errors?.password?.message}</FieldError>
              </Field>
              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl text-base font-medium"
                size="lg"
                disabled={isPending}
              >
                {isPending && <Spinner className="mr-2" />}
                เข้าสู่ระบบ
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-sm">
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
      {role !== UserRole.CUSTOMER && <SupportContact />}
      {role === UserRole.CUSTOMER && <ProtectedByBrand />}
    </div>
  )
}
