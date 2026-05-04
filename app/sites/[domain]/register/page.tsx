import Link from 'next/link'

import { REGISTER_PROVIDERS } from '@/constants/register'

import { SSOButton } from '@/components/SSOButton'

export default function StoreRegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-120px)] flex-col justify-center gap-5 p-4 sm:p-10">
      <div className="sm:shadow-airy mx-auto flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white p-6 sm:gap-10 sm:p-14">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          สมัครบัญชีซื้อของออนไลน์ของคุณ
        </h1>

        <div className="flex w-full flex-col gap-4 sm:max-w-md">
          {REGISTER_PROVIDERS.map((provider, idx) => {
            return (
              <div
                key={idx}
                className="w-full transition-transform active:scale-[0.98]"
              >
                <SSOButton {...provider} />
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-slate-600 sm:text-base">
          มีบัญชีแล้วใช่มั้ย? <br className="sm:hidden" />
          <Link href="/login" className="mt-1 inline-block sm:mt-0">
            <span className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4 transition-colors">
              เข้าสู่ระบบเลยสิ!
            </span>
          </Link>
        </p>
      </div>
    </div>
  )
}
