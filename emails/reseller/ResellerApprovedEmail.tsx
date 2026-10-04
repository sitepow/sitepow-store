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

interface ResellerApprovedEmailProps {
  supplierStoreName?: string
  resellerStoreName?: string
  catalogUrl?: string
}

export default function ResellerApprovedEmail({
  supplierStoreName = 'My Awesome Supplier',
  resellerStoreName = 'ร้านค้าของคุณ',
  catalogUrl = '/',
}: ResellerApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        คำขอเป็นตัวแทนจำหน่ายได้รับการอนุมัติแล้ว - {supplierStoreName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              อนุมัติการเป็นตัวแทนจำหน่าย
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              ยินดีด้วย! {supplierStoreName}{' '}
              ได้อนุมัติคำขอเชื่อมต่อตัวแทนจำหน่ายสำหรับ {resellerStoreName}{' '}
              เรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              สถานะบัญชีตัวแทน:
            </Text>
            <Text className="my-2 text-xl font-semibold tracking-wide opacity-90">
              ได้รับการอนุมัติ (Approved)
            </Text>
            <Section className="my-6">
              <Link
                href={catalogUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ดูแคตตาล็อกและเริ่มเลือกสินค้า
              </Link>
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                ตอนนี้คุณสามารถเลือกนำรายการสินค้าของซัพพลายเออร์ไปขายในร้านค้าของคุณ
                และจัดการคำสั่งซื้อผ่านระบบตัวแทนได้ทันที
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
