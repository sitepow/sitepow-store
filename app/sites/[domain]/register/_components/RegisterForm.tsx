'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

import { registerUser } from '@/actions/auth'
import { REGISTER_PROVIDERS } from '@/constants/register'
import { UserRole } from '@/generated/prisma/enums'
import { RegisterFormInputs } from '@/types/register'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeftIcon } from 'lucide-react'

import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { SSOButton } from '@/components/SSOButton'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function StoreRegisterForm() {
  const [isCredentials, setIsCredentials] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: async (_, variables) => {
      const result = await signIn('credentials', {
        email: variables.email,
        password: variables.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(
          'สมัครสมาชิกสำเร็จ แต่เข้าสู่ระบบล้มเหลว กรุณาเข้าสู่ระบบเอง',
        )
        window.location.href = '/login'
        return
      }

      window.location.href = '/'
    },
  })

  const handleRegister = async (providerId: string) => {
    if (providerId === 'credentials') {
      setIsCredentials(true)
    } else {
      await signIn(providerId)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-120px)] flex-col justify-center gap-5 p-4 sm:p-10">
      <div className="sm:shadow-airy mx-auto flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white p-6 sm:gap-10 sm:p-14">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          สมัครบัญชีซื้อของออนไลน์ของคุณ
        </h1>

        {isCredentials && (
          <form
            onSubmit={handleSubmit((data) =>
              mutate({ ...data, userRole: UserRole.CUSTOMER }),
            )}
            className="flex w-full flex-col gap-3 sm:max-w-md"
          >
            <Field>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                placeholder="ระบุ E-mail ของคุณ"
                className="h-12 rounded-xl"
                {...register('email', {
                  required: 'โปรดระบุ E-mail ของคุณ',
                })}
              />
              <FieldDescription>
                โปรดใช้อีเมลจริงเท่านั้น
                เนื่องจากระบบจะส่งลิงค์ยืนยันไปให้หลังจากสมัครสมาชิกสำเร็จแล้ว
              </FieldDescription>
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

            <Field>
              <FieldLabel>ยืนยันรหัสผ่าน</FieldLabel>
              <Input
                type="password"
                placeholder="ระบุรหัสผ่านเดิมอีกครั้ง"
                className="h-12 rounded-xl"
                {...register('confirmPassword', {
                  required: 'โปรดระบุรหัสผ่านอีกครั้ง',
                })}
              />
              <FieldError>{errors?.confirmPassword?.message}</FieldError>
            </Field>

            <div className="mt-2 grid grid-cols-12 gap-2">
              <Button className="col-span-8" size="lg" disabled={isPending}>
                {isPending && <Spinner />} สมัครสมาชิก
              </Button>
              <Button
                className="col-span-4"
                variant="outline"
                size="lg"
                disabled={isPending}
                onClick={() => setIsCredentials(false)}
              >
                <ArrowLeftIcon /> ย้อนกลับ
              </Button>
            </div>
          </form>
        )}

        {!isCredentials && (
          <div className="flex w-full flex-col gap-4 sm:max-w-md">
            {REGISTER_PROVIDERS.map((provider, idx) => {
              return (
                <div
                  key={idx}
                  className="w-full transition-transform active:scale-[0.98]"
                >
                  <SSOButton
                    onClick={() => handleRegister(provider.id)}
                    {...provider}
                  />
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-sm text-slate-600 sm:text-base">
          มีบัญชีแล้วใช่มั้ย? <br className="sm:hidden" />
          <Link href="/login" className="mt-1 inline-block sm:mt-0">
            <span className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4 transition-colors">
              เข้าสู่ระบบเลยสิ!
            </span>
          </Link>
        </p>

        <ProtectedByBrand />
      </div>
    </div>
  )
}
