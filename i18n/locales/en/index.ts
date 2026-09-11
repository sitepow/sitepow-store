import auth from './auth.json'
import blogs from './blogs.json'
import common from './common.json'
import contact from './contact.json'
import customer from './customer.json'
import docs from './docs.json'
import downloadPos from './downloadPos.json'
import features from './features.json'
import home from './home.json'
import merchant from './merchant.json'
import pricing from './pricing.json'
import storefront from './storefront.json'

export const en = {
  common,
  home,
  pricing,
  merchant,
  customer,
  storefront,
  auth,
  contact,
  downloadPos,
  features,
  blogs,
  docs,
} as const

export default en
