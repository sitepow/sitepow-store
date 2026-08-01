import { Resend } from 'resend'

const resendSingleton = () => {
  return new Resend(process.env.RESEND_API_KEY)
}

declare global {
  var resendGlobal: undefined | ReturnType<typeof resendSingleton>
}

export const resend = globalThis.resendGlobal ?? resendSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.resendGlobal = resend
}
