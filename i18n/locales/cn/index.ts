import auth from './auth.json'
import common from './common.json'
import customer from './customer.json'
import home from './home.json'
import merchant from './merchant.json'
import pricing from './pricing.json'
import storefront from './storefront.json'

export const cn = {
  common,
  home,
  pricing,
  merchant,
  customer,
  storefront,
  auth,
} as const

export default cn
