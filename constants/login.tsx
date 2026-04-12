import { LoginProvide } from '@/types/login'

import { AppleIcon } from '@/components/icon/Apple'
import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const LOGIN_PROVIDERS = [
  { icon: <GoogleIcon /> },
  { icon: <FacebookIcon /> },
  {
    icon: <LineIcon />,
  },
  { icon: <AppleIcon /> },
] as LoginProvide[]
