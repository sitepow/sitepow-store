import { ReactNode } from 'react'

import { ContentDivider } from '@/components/ContentDivider'
import { SupportContact } from '@/components/SupportContact'
import { AppleIcon } from '@/components/icon/Apple'
import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginProvide {
  icon: ReactNode
}

const LOGIN_PROVIDERS = [
  { icon: <GoogleIcon /> },
  { icon: <FacebookIcon /> },
  {
    icon: <LineIcon />,
  },
  { icon: <AppleIcon /> },
] as LoginProvide[]

const LoginProviderItem = ({ icon }: LoginProvide) => {
  return (
    <div className="group flex min-w-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-gray-200 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center">
        {icon}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="flex">
        <div className="w-full rounded-2xl bg-gray-200" />
        <div className="shadow-airy -ml-5 flex w-full flex-col items-center gap-10 rounded-2xl bg-white p-14">
          <h1 className="text-2xl font-bold">เข้าสู่ระบบหลังบ้านของคุณ</h1>

          <ContentDivider name="ด้วย E-mail" />

          <form className="flex w-3/5 flex-col gap-2.5">
            <Input placeholder="ระบุ E-mail ของคุณ" />
            <Input placeholder="ระบุรหัสผ่าน" />
            <Button>เข้าสู่ระบบ</Button>
          </form>

          <ContentDivider name="ด้วยบัญชี Social" />

          <div className="flex w-full justify-center gap-5">
            {LOGIN_PROVIDERS.map((provider, idx) => {
              return <LoginProviderItem key={idx} {...provider} />
            })}
          </div>
        </div>
      </div>

      <SupportContact />
    </div>
  )
}
