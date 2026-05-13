import { LoginProvide } from '@/types/login'

import { FacebookIcon } from '@/components/icon/Facebook'
import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const LOGIN_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon /> },
  { id: 'facebook', icon: <FacebookIcon /> },
  { id: 'line', icon: <LineIcon /> },
] as LoginProvide[]
