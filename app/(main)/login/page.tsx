import { LOGIN_PROVIDERS } from '@/constants/login'

import { ContentDivider } from '@/components/ContentDivider'
import { SSOButton } from '@/components/SSOButton'
import { SectionHeader } from '@/components/SectionHeader'
import { SupportContact } from '@/components/SupportContact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col justify-center gap-6 p-4 text-center sm:p-10 lg:max-w-7xl">
      <div className="flex w-full">
        <div className="hidden w-full rounded-l-3xl bg-gray-200 lg:block" />

        <div className="sm:shadow-airy flex w-full flex-col items-center gap-8 rounded-3xl bg-white p-6 sm:p-10 md:p-14 lg:-ml-6 lg:rounded-r-3xl">
          <SectionHeader title="เข้าสู่ระบบหลังบ้านของคุณ" />

          <div className="w-full max-w-md space-y-8">
            <div className="space-y-6">
              <ContentDivider name="ด้วย E-mail" />

              <form className="flex flex-col gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="ml-1 text-sm font-medium text-slate-700">
                    E-mail
                  </label>
                  <Input
                    placeholder="ระบุ E-mail ของคุณ"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="ml-1 text-sm font-medium text-slate-700">
                    รหัสผ่าน
                  </label>
                  <Input
                    type="password"
                    placeholder="ระบุรหัสผ่าน"
                    className="h-12 rounded-xl"
                  />
                </div>
                <Button
                  size="lg"
                  className="mt-2 h-12 w-full rounded-xl font-bold shadow-sm"
                >
                  เข้าสู่ระบบ
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <ContentDivider name="ด้วยบัญชี Social" />

              <div className="flex w-full flex-wrap justify-center gap-4">
                {LOGIN_PROVIDERS.map((provider, idx) => (
                  <div key={idx} className="shrink-0">
                    <SSOButton {...provider} />
                  </div>
                ))}
              </div>
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
