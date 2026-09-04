import { RegisterProvide } from '@/types/register'

import { GoogleIcon } from '@/components/icon/Google'
import { LineIcon } from '@/components/icon/Line'

export const REGISTER_PROVIDERS = [
  { id: 'google', icon: <GoogleIcon />, name: 'Google' },
  {
    id: 'line',
    icon: <LineIcon />,
    name: 'LINE',
  },
] as RegisterProvide[]
