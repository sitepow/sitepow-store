import { REGISTER_PROVIDERS } from '@/constants/register'

import { SSOButton } from '@/components/SSOButton'
import { SupportContact } from '@/components/SupportContact'

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="flex">
        <div className="w-full rounded-l-2xl bg-gray-200" />
        <div className="shadow-airy -ml-5 flex w-full flex-col items-center gap-10 rounded-2xl bg-white p-14">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">สมัครเปิดร้านค้าของคุณที่นี่</h1>
            <p className="opacity-50">
              ทดลองใช้งาน Platinum Plus package ฟรี 14 วัน
            </p>
          </div>

          <div className="flex w-full flex-col gap-5">
            {REGISTER_PROVIDERS.map((provider, idx) => {
              return <SSOButton key={idx} {...provider} />
            })}
          </div>
        </div>
      </div>

      <SupportContact />
    </div>
  )
}
