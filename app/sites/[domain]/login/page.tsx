import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getStore } from '@/actions/store'

import { LoginForm } from '@/components/LoginForm'

import { getCurrentUser } from '@/lib/auth-server'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  return {
    title: store?.name ? `เข้าสู่ระบบ | ${store.name}` : 'เข้าสู่ระบบ',
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  }
}

export default async function TenantLoginPage({ params }: Props) {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  const { domain } = await params
  const store = await getStore({ domain })

  return <LoginForm store={store} isStore={true} />
}
