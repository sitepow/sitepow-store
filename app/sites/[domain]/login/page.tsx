import Link from 'next/link'

import { LOGIN_PROVIDERS } from '@/constants/login'

import { ContentDivider } from '@/components/ContentDivider'
import { SSOButton } from '@/components/SSOButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function StoreLoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-120px)] flex-col justify-center gap-5 p-4 sm:p-10">
      <div className="sm:shadow-airy mx-auto flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white p-6 sm:gap-10 sm:p-14">
        <h1 className="text-xl font-bold sm:text-2xl">
          เข้าสู่ระบบร้านค้าของคุณ
        </h1>

        <div className="w-full">
          <ContentDivider name="ด้วย E-mail" />
        </div>

        <form className="flex w-full flex-col gap-3 sm:w-4/5 md:w-3/5">
          <div className="space-y-1">
            <Input
              placeholder="ระบุ E-mail ของคุณ"
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-1">
            <Input
              type="password"
              placeholder="ระบุรหัสผ่าน"
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
          <Button className="h-12 rounded-xl font-bold shadow-sm transition-transform active:scale-[0.98]">
            เข้าสู่ระบบ
          </Button>
        </form>

        <div className="w-full">
          <ContentDivider name="ด้วยบัญชี Social" />
        </div>

        <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-5">
          {LOGIN_PROVIDERS.map((provider, idx) => (
            <div
              key={idx}
              className="shrink-0 transition-transform active:scale-95"
            >
              <SSOButton {...provider} />
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
      </div>
    </div>
  )
}
