import { defineRouting } from 'next-intl/routing'

import { SUPPORTED_LNGS } from '@/constants/system'

const routing = defineRouting({
  locales: SUPPORTED_LNGS,
  defaultLocale: SUPPORTED_LNGS[0],
})

export { routing }
