import { RegisterProvide } from '@/types/register'

import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const REGISTER_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon />, name: 'สมัครต่อด้วย Gmail' },
  {
    id: 'line',
    icon: <LineIcon />,
    name: 'สมัครต่อด้วย Line',
  },
] as RegisterProvide[]
