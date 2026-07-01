import Image from 'next/image'
import Link from 'next/link'

interface StoreLogoProps {
  image?: string
}

export function StoreLogo({ image }: StoreLogoProps) {
  return (
    <Link href="/" className="block h-20 w-fit max-w-50 overflow-hidden">
      <Image
        width={200}
        height={80}
        alt="store-logo"
        src={image || '/images/navigation/navigation-header.jpeg'}
        className="size-full object-contain object-center"
      />
    </Link>
  )
}
