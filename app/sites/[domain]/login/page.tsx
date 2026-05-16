import { redirect } from 'next/navigation'

import { auth } from '@/auth'

import { StoreLoginForm } from './_components/LoginForm'

export default async function StoreLoginPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return <StoreLoginForm />
}
