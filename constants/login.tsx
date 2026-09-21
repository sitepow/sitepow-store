import { LoginProvide } from '@/types/login'

import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const LOGIN_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon /> },
  { id: 'line', icon: <LineIcon /> },
] as LoginProvide[]
