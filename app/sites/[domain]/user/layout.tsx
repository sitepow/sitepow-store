import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'บัญชีผู้ใช้',
    template: '%s | บัญชีผู้ใช้',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function UserAreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

