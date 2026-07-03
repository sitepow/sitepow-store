import common from './common.json'
import home from './home.json'

export const en = {
  ...common,
  ...home,
} as const

export default en
