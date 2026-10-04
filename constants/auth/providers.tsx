import { LoginProvide } from '@/types/auth'
import { RegisterProvide } from '@/types/auth'

import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const LOGIN_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon /> },
  { id: 'line', icon: <LineIcon /> },
] as LoginProvide[]

export const REGISTER_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon />, name: 'สมัครต่อด้วย Gmail' },
  {
    id: 'line',
    icon: <LineIcon />,
    name: 'สมัครต่อด้วย Line',
  },
] as RegisterProvide[]
