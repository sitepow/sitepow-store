'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { LOGIN_PROVIDERS } from '@/constants/login'
import { UserRole } from '@/generated/prisma/enums'
import { LoginFormInputs } from '@/types/login'
import { useMutation } from '@tanstack/react-query'
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react'

import { ContentDivider } from '@/components/ContentDivider'
import { ForgotPasswordDialog } from '@/components/ForgotPasswordForm'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth-client'

export function LoginForm() {
  const t = useTranslations('auth.login')
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as UserRole
  const callbackUrl = searchParams.get('callbackUrl') || '/'

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
        toast.error(t('invalidCredentials'))
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
      toast.error(t('networkError'))
    }
  }

  const onSubmit = (data: LoginFormInputs) => {
    mutate(data)
  }

  const isCustomer = role === UserRole.CUSTOMER

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-3.5 sm:gap-6 sm:p-6 lg:p-10">
      <div className="border-border/80 bg-card text-card-foreground w-full max-w-md overflow-hidden rounded-2xl border p-4.5 shadow-xl shadow-black/[0.03] sm:rounded-3xl sm:p-8 md:p-10 dark:shadow-black/20">
        <div className="mb-4 flex justify-center sm:mb-6">
          <LogoBrand className="text-xl" />
        </div>
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="space-y-1.5 text-center sm:space-y-2">
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-3xl">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {isCustomer ? t('buyerSubtitle') : t('merchantSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {LOGIN_PROVIDERS.map((provider, idx) => (
              <SSOButton
                key={idx}
                onClick={() => handleSSO(provider.id)}
                {...provider}
              />
            ))}
          </div>
          <ContentDivider name={t('orEmail')} />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            <Field>
              <FieldLabel className="text-xs font-medium">
                {t('emailLabel')}
              </FieldLabel>
              <div className="relative">
                <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="h-10 rounded-xl pl-10 text-sm sm:h-11"
                  {...register('email', {
                    required: t('emailRequired'),
                  })}
                />
              </div>
              <FieldError>{errors?.email?.message}</FieldError>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs font-medium">
                  {t('passwordLabel')}
                </FieldLabel>
                <ForgotPasswordDialog />
              </div>
              <div className="relative">
                <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  className="h-10 rounded-xl pr-10 pl-10 text-sm sm:h-11"
                  {...register('password', {
                    required: t('passwordRequired'),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                  aria-label={
                    showPassword ? t('hidePassword') : t('showPassword')
                  }
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
            <RainbowButton
              type="submit"
              className="h-10 w-full sm:h-11"
              size="lg"
              disabled={isPending}
            >
              {isPending && <Spinner className="mr-2" />}
              {isPending ? t('submitting') : t('submit')}
            </RainbowButton>
          </form>
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            {t('noAccount')}{' '}
            <a
              href={registerHref}
              className="text-primary font-semibold transition-all hover:underline"
            >
              {t('registerFree')}
            </a>
          </p>
        </div>
      </div>
      {isCustomer && <ProtectedByBrand />}
    </div>
  )
}
