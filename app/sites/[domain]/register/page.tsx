import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getStore } from '@/actions/store'

import { RegisterForm } from '@/components/RegisterForm'

import { getCurrentUser } from '@/lib/auth-server'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params
  const store = await getStore({ domain })

  return {
    title: store?.name ? `สมัครสมาชิก | ${store.name}` : 'สมัครสมาชิก',
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  }
}

export default async function TenantRegisterPage({ params }: Props) {
  const userSession = await getCurrentUser()

  if (userSession) {
    redirect('/')
  }

  const { domain } = await params
  const store = await getStore({ domain })

  return <RegisterForm store={store} isStore={true} />
}
