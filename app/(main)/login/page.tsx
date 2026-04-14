import { LOGIN_PROVIDERS } from '@/constants/login'

import { ContentDivider } from '@/components/ContentDivider'
import { SSOButton } from '@/components/SSOButton'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="flex">
        <div className="w-full rounded-l-2xl bg-gray-200" />
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
              return <SSOButton key={idx} {...provider} />
            })}
          </div>
        </div>
      </div>

      <SupportContact />
    </div>
  )
}
