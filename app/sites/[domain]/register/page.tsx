import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

import { StoreRegisterForm } from './_components/RegisterForm'

export default async function StoreRegisterPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return <StoreRegisterForm />
}
