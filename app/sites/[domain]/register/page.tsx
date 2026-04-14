import Link from 'next/link'

import { REGISTER_PROVIDERS } from '@/constants/register'

import { SSOButton } from '@/components/SSOButton'

export default function StoreRegisterPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="shadow-airy mx-auto flex w-2xl flex-col items-center gap-10 rounded-2xl bg-white p-14">
        <h1 className="text-2xl font-bold">สมัครบัญชีซื้อของออนไลน์ของคุณ</h1>

        <div className="flex w-full flex-col gap-5">
          {REGISTER_PROVIDERS.map((provider, idx) => {
            return <SSOButton key={idx} {...provider} />
          })}
        </div>

        <p className="text-center">
          มีบัญชีแล้วใช่มั้ย? <br />
          <Link href="/login">
            <span className="text-primary underline">เข้าสู่ระบบเลยสิ!</span>
          </Link>
        </p>
      </div>
    </div>
  )
}
