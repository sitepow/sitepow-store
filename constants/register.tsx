import { RegisterProvide } from '@/types/register'
import { IconMail } from '@tabler/icons-react'

import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const REGISTER_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon />, name: 'สมัครต่อด้วย Gmail' },
  { id: 'facebook', icon: <FacebookIcon />, name: 'สมัครต่อด้วย Facebook' },
  {
    id: 'line',
    icon: <LineIcon />,
    name: 'สมัครต่อด้วย Line',
  },
  {
    id: 'credentials',
    icon: <IconMail className="size-8" stroke={1.5} />,
    name: 'สมัครต่อด้วย E-mail',
  },
] as RegisterProvide[]
