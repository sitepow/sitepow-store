'use client'

import { useRouter } from 'next/navigation'

import { loginWithSocial } from '@/actions/auth'
import { REGISTER_PROVIDERS } from '@/constants/register'

import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
import { SupportContact } from '@/components/SupportContact'

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async (providerId: string) => {
    if (providerId === 'local') {
      router.push('/register/email')
    } else {
      await loginWithSocial(providerId)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 text-center sm:p-10 lg:max-w-7xl">
      <div className="flex w-full">
        <div className="hidden w-full rounded-l-3xl bg-gray-200 lg:block" />

        <div className="sm:shadow-airy flex w-full flex-col items-center gap-8 rounded-3xl bg-white px-0 py-6 sm:p-10 md:p-14 lg:-ml-6 lg:rounded-r-3xl">
          <SectionHeader
            title={'สมัครเปิดร้านค้าของคุณที่นี่'}
            description={
              <>
                เพื่อขอทดลองใช้งาน{' '}
                <span className="text-bold text-primary">Pro Package</span> ฟรี
                14 วัน ยังไม่ต้องชำระเงิน ไม่มีข้อผูกมัด
              </>
            }
          />

          <div className="w-full max-w-md space-y-8">
            <div className="space-y-6">
              <div className="flex w-full flex-col gap-4">
                {REGISTER_PROVIDERS.map((provider, idx) => (
                  <div
                    key={idx}
                    className="w-full transition-transform active:scale-[0.98]"
                  >
                    <SSOButton
                      onClick={() => handleRegister(provider.id)}
                      {...provider}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-slate-500">
                มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                <a
                  href="/login"
                  className="text-primary transition-all hover:underline"
                >
                  เข้าสู่ระบบที่นี่
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <SupportContact />
      </div>
    </div>
  )
}
