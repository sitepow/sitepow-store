import common from './common.json'
import home from './home.json'

export const cn = {
  ...common,
  ...home,
} as const

export default cn
