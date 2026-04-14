import Link from 'next/link'

import { LOGIN_PROVIDERS } from '@/constants/login'

import { ContentDivider } from '@/components/ContentDivider'
import { SSOButton } from '@/components/SSOButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function StoreLoginPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="shadow-airy mx-auto flex w-2xl flex-col items-center gap-10 rounded-2xl bg-white p-14">
        <h1 className="text-2xl font-bold">เข้าสู่ระบบร้านค้าของคุณ</h1>

        <ContentDivider name="ด้วย E-mail" />

        <form className="flex w-3/5 flex-col gap-2.5">
          <Input placeholder="ระบุ E-mail ของคุณ" />
          <Input placeholder="ระบุรหัสผ่าน" />
          <Button>เข้าสู่ระบบ</Button>
        </form>

        <ContentDivider name="ด้วยบัญชี Social" />

        <div className="flex w-full justify-center gap-5">
          {LOGIN_PROVIDERS.map((provider, idx) => {
            return <SSOButton key={idx} {...provider} />
          })}
        </div>

        <p className="text-center">
          หรือยังไม่มีบัญชีใช่มั้ย? <br />
          <Link href="/register">
            <span className="text-primary underline">สมัครสมาชิกเลยสิ!</span>
          </Link>
        </p>
      </div>
    </div>
  )
}
