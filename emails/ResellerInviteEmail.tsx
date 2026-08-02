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

import { EmailFooter } from './_components/EmailFooter'

interface ResellerInviteEmailProps {
  supplierStoreName?: string
  inviteLink?: string
  expiryDays?: number
}

export default function ResellerInviteEmail({
  supplierStoreName = 'My Awesome Supplier',
  inviteLink = '/',
  expiryDays = 7,
}: ResellerInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        คำเชิญเชื่อมต่อเป็นตัวแทนจำหน่ายสินค้า - {supplierStoreName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              เชิญเชื่อมต่อตัวแทนจำหน่าย
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              {supplierStoreName} ได้เชิญคุณเข้าร่วมเป็นตัวแทนจำหน่ายสินค้า
              (Reseller)
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ร้านค้าผู้ซัพพลายเออร์:
            </Text>
            <Text className="my-2 text-xl font-semibold tracking-wide opacity-90">
              {supplierStoreName}
            </Text>
            <Section className="my-6">
              <Link
                href={inviteLink}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ตอบรับคำเชิญเชื่อมต่อร้านค้า
              </Link>
            </Section>
            <Text className="text-sm opacity-50">
              คำเชิญนี้มีอายุการใช้งาน {expiryDays} วัน
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                เมื่อตอบรับคำเชิญ
                คุณจะสามารถเลือกดึงรายการสินค้ามาขายในร้านของคุณ
                รวมถึงจัดการสต๊อกและคำสั่งซื้อผ่านระบบตัวแทนได้อย่างสะดวก
                หากคุณไม่ได้คาดว่าจะได้รับคำขอนี้
                สามารถข้ามหรือลบอีเมลนี้ได้ทันที
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
