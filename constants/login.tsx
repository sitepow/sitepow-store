import { LoginProvide } from '@/types/login'

import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const LOGIN_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon />, name: 'Google' },
  { id: 'line', icon: <LineIcon />, name: 'LINE' },
] as LoginProvide[]
