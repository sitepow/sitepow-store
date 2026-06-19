'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { signIn } from 'next-auth/react'

import { LOGIN_PROVIDERS } from '@/constants/login'
import { LoginFormInputs } from '@/types/login'
import { useMutation } from '@tanstack/react-query'

import { ContentDivider } from '@/components/ContentDivider'
import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function LoginForm() {
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
    <div className="text-foreground container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 sm:p-10 lg:max-w-7xl">
      <div className="flex w-full">
        <div className="bg-foreground/10 hidden w-full rounded-l-3xl lg:block" />
        <div className="sm:shadow-airy border-border bg-background flex w-full flex-col items-center gap-8 rounded-3xl border p-6 sm:p-10 md:p-14 lg:-ml-6 lg:rounded-r-3xl dark:bg-neutral-800">
          <SectionHeader title="เข้าสู่ระบบหลังบ้านของคุณ" />
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-6">
              <ContentDivider name="ด้วย E-mail" />
              <div className="flex flex-col gap-3">
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
                  className="col-span-7"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending && <Spinner />}
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              <ContentDivider name="ด้วยบัญชี Social" />
              <div className="flex w-full flex-wrap justify-center gap-4">
                {LOGIN_PROVIDERS.map((provider, idx) => (
                  <div key={idx} className="shrink-0">
                    <SSOButton
                      onClick={async () => await signIn(provider.id)}
                      {...provider}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm">
            ยังไม่มีบัญชีใช่มั้ย?{' '}
            <a
              href="/register"
              className="text-primary transition-all hover:underline"
            >
              สมัครสมาชิก
            </a>
          </p>
        </div>
      </div>
      <SupportContact />
    </div>
  )
}
