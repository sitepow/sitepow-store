/* eslint-disable react-hooks/immutability */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { registerUser } from '@/actions/auth'
import { REGISTER_PROVIDERS } from '@/constants/register'
import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/register'
import { useMutation } from '@tanstack/react-query'
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react'

import { ContentDivider } from '@/components/ContentDivider'
import { LogoBrand } from '@/components/LogoBrand'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/lib/auth-client'

export function RegisterForm() {
  const t = useTranslations('auth.register')
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as UserRole
  const currentRole = roleParam || UserRole.MERCHANT
  const callbackUrl = searchParams.get('callbackUrl') || '/'

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
        return
      }

      const response = await authClient.signIn.email({
        email: variables.email,
        password: variables.password,
      })

      if (response.error) {
        toast.error(t('autoLoginFailed'))
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
      toast.error(t('networkError'))
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
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 p-3.5 sm:gap-6 sm:p-6 lg:p-10">
      <div className="border-border/80 bg-card text-card-foreground w-full max-w-md overflow-hidden rounded-2xl border p-4.5 shadow-xl shadow-black/[0.03] sm:rounded-3xl sm:p-8 md:p-10 dark:shadow-black/20">
        <div className="mb-4 flex justify-center sm:mb-6">
          <LogoBrand className="text-xl" />
        </div>
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="space-y-1.5 text-center sm:space-y-2">
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-3xl">
              {isCustomer ? t('buyerTitle') : t('merchantTitle')}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {isCustomer ? t('buyerSubtitle') : t('merchantSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {REGISTER_PROVIDERS.map((provider, idx) => (
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
            className="space-y-3 sm:space-y-3.5"
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
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('emailInvalid'),
                    },
                  })}
                />
              </div>
              <p className="text-muted-foreground text-[11px]">
                {t('emailNotice')}
              </p>
              <FieldError>{errors?.email?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-medium">
                {t('passwordLabel')}
              </FieldLabel>
              <div className="relative">
                <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  className="h-10 rounded-xl pr-10 pl-10 text-sm sm:h-11"
                  {...register('password', {
                    required: t('passwordRequired'),
                    minLength: {
                      value: 6,
                      message: t('passwordMinLength'),
                    },
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
              <div className="flex items-center gap-1.5 text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 transition-colors ${
                    isPasswordLongEnough
                      ? 'font-medium text-emerald-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  <CheckIcon className="size-3" /> {t('passwordMinLengthHint')}
                </span>
              </div>
              <FieldError>{errors?.password?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-medium">
                {t('confirmPasswordLabel')}
              </FieldLabel>
              <div className="relative">
                <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="h-10 rounded-xl pr-10 pl-10 text-sm sm:h-11"
                  {...register('confirmPassword', {
                    required: t('confirmPasswordRequired'),
                    validate: (value) =>
                      value === passwordValue || t('passwordMismatch'),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                  aria-label={
                    showConfirmPassword ? t('hidePassword') : t('showPassword')
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
                      ? t('passwordMatching')
                      : t('passwordNotMatching')}
                  </span>
                </div>
              )}
              <FieldError>{errors?.confirmPassword?.message}</FieldError>
            </Field>

            <RainbowButton
              type="submit"
              className="mt-1 h-10 w-full sm:h-11"
              size="lg"
              disabled={isPending}
            >
              {isPending && <Spinner className="mr-2" />}
              {isPending ? t('submitting') : t('submit')}
            </RainbowButton>
          </form>
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            {t('hasAccount')}{' '}
            <a
              href={loginHref}
              className="text-primary font-semibold transition-all hover:underline"
            >
              {t('loginNow')}
            </a>
          </p>
        </div>
      </div>
      {currentRole === UserRole.CUSTOMER && <ProtectedByBrand />}
    </div>
  )
}
