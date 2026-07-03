import common from './common.json'
import home from './home.json'

export const th = {
  ...common,
  ...home,
} as const

export default th
