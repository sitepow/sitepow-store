import { ReactNode } from 'react'

import { MailIcon } from 'lucide-react'

import { SupportContact } from '@/components/SupportContact'
import { AppleIcon } from '@/components/icon/Apple'
import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

interface RegisterProvide {
  icon: ReactNode
  name: string
}

const REGISTER_PROVIDERS = [
  { icon: <GoogleIcon />, name: 'สมัครต่อด้วย Gmail' },
  { icon: <FacebookIcon />, name: 'สมัครต่อด้วย Facebook' },
  {
    icon: <LineIcon />,
    name: 'สมัครต่อด้วย Line',
  },
  { icon: <AppleIcon />, name: 'สมัครต่อด้วย Apple ID' },
  { icon: <MailIcon className="size-8" />, name: 'สมัครต่อด้วย E-mail' },
] as RegisterProvide[]

const RegisterProviderItem = ({ icon, name }: RegisterProvide) => {
  return (
    <div className="group flex w-full cursor-pointer items-center rounded-2xl border-2 border-gray-200 px-5 py-2.5">
      <div className="flex size-8 items-center justify-center">{icon}</div>
      <p className="mx-auto text-xl font-bold text-neutral-400 duration-200 group-hover:text-neutral-800">
        {name}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col justify-center gap-5 p-10">
      <div className="flex">
        <div className="w-full rounded-2xl bg-gray-200" />
        <div className="shadow-airy -ml-5 flex w-full flex-col items-center gap-10 rounded-2xl bg-white p-14">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">สมัครเปิดร้านค้าของคุณที่นี่</h1>
            <p className="opacity-50">
              ทดลองใช้งาน Platinum Plus package ฟรี 14 วัน
            </p>
          </div>

          <div className="flex w-full flex-col gap-5">
            {REGISTER_PROVIDERS.map((provider, idx) => {
              return <RegisterProviderItem key={idx} {...provider} />
            })}
          </div>
        </div>
      </div>

      <SupportContact />
    </div>
  )
}
