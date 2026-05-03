import { RegisterProvide } from '@/types/register'
import { IconMail } from '@tabler/icons-react'

import { AppleIcon } from '@/components/icon/Apple'
import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const REGISTER_PROVIDERS = [
  { icon: <GoogleIcon />, name: 'สมัครต่อด้วย Gmail' },
  { icon: <FacebookIcon />, name: 'สมัครต่อด้วย Facebook' },
  {
    icon: <LineIcon />,
    name: 'สมัครต่อด้วย Line',
  },
  { icon: <AppleIcon />, name: 'สมัครต่อด้วย Apple ID' },
  {
    icon: <IconMail className="size-8" stroke={1.5} />,
    name: 'สมัครต่อด้วย E-mail',
  },
] as RegisterProvide[]
