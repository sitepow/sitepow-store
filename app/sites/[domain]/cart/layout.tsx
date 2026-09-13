import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ตะกร้าสินค้า',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

