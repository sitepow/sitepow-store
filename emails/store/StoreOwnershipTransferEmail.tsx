import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { EmailFooter } from '@/emails/components/EmailFooter'

interface StoreOwnershipTransferEmailProps {
  storeName?: string
  fromOwnerName?: string
  acceptLink?: string
  expiryHours?: number
}

export default function StoreOwnershipTransferEmail({
  storeName = 'Sitepow Store',
  fromOwnerName = 'สมชาย ใจดี',
  acceptLink = '/',
  expiryHours = 24,
}: StoreOwnershipTransferEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>คำขอโอนย้ายความเป็นเจ้าของร้าน {storeName}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              โอนย้ายความเป็นเจ้าของร้าน
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              {fromOwnerName} ได้ส่งคำขอโอนย้ายสิทธิ์ความเป็นเจ้าของร้าน{' '}
              {storeName} ให้กับคุณ
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ร้านค้าที่จะทำการรับโอน:
            </Text>
            <Text className="my-2 text-xl font-semibold tracking-wide opacity-90">
              {storeName}
            </Text>
            <Section className="my-6">
              <Link
                href={acceptLink}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ยอมรับการรับโอนสิทธิ์
              </Link>
            </Section>
            <Text className="text-sm opacity-50">
              คำขอนี้มีอายุการใช้งาน {expiryHours} ชั่วโมง
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                เมื่อคุณกดยืนยัน สิทธิ์ในการจัดการ สถิติ
                และข้อมูลทั้งหมดของร้านจะถูกเปลี่ยนมาเป็นของคุณ
                หากคุณไม่ได้คาดว่าจะได้รับคำขอนี้
                สามารถข้ามหรือลบอีเมลนี้ได้อย่างปลอดภัย
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
