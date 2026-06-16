'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

import { LOGIN_PROVIDERS } from '@/constants/login'
import { LoginFormInputs } from '@/types/login'
import { useMutation } from '@tanstack/react-query'

import { ContentDivider } from '@/components/ContentDivider'
import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function StoreLoginForm() {
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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return result
    },
    onSuccess: (data) => {
      if (data?.error) {
        if (data.error === 'CredentialsSignin') {
          toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else {
          toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        }
        return
      }

      window.location.href = '/'
    },
  })

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-120px)] flex-col justify-center gap-5 p-4 sm:p-10">
      <div className="sm:shadow-airy mx-auto flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white p-6 sm:gap-10 sm:p-14">
        <h1 className="text-xl font-bold sm:text-2xl">
          เข้าสู่ระบบร้านค้าของคุณ
        </h1>

        <div className="w-full">
          <ContentDivider name="ด้วย E-mail" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-4/5 md:w-3/5">
          <Field>
            <FieldLabel>E-mail</FieldLabel>
            <Input
              placeholder="ระบุ E-mail ของคุณ"
              className="h-12 rounded-xl"
              {...register('email', {
                required: 'โปรดระบุ E-mail ของคุณ',
              })}
            />
            <FieldError>{errors?.email?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>รหัสผ่าน</FieldLabel>
            <Input
              type="password"
              placeholder="ระบุรหัสผ่าน"
              className="h-12 rounded-xl"
              {...register('password', { required: 'โปรดระบุรหัสผ่าน' })}
            />
            <FieldError>{errors?.password?.message}</FieldError>
          </Field>

          <Button
            onClick={handleSubmit((data) => mutate(data))}
            disabled={isPending}
            size="lg"
          >
            {isPending && <Spinner />} เข้าสู่ระบบ
          </Button>
        </div>

        <div className="w-full">
          <ContentDivider name="ด้วยบัญชี Social" />
        </div>

        <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-5">
          {LOGIN_PROVIDERS.map((provider, idx) => (
            <div
              key={idx}
              className="shrink-0 transition-transform active:scale-95"
            >
              <SSOButton
                onClick={async () => await signIn(provider.id)}
                {...provider}
              />
            </div>
          ))}
        </div>

        <p className="text-center text-sm leading-relaxed sm:text-base">
          ยังไม่มีบัญชีใช่มั้ย? <br className="sm:hidden" />
          <Link href="/register" className="mt-1 inline-block sm:mt-0">
            <span className="text-primary font-semibold underline underline-offset-4">
              สมัครสมาชิกเลยสิ!
            </span>
          </Link>
        </p>

        <ProtectedByBrand />
      </div>
    </div>
  )
}
