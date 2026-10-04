import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { EmailFooter } from '@/emails/components/EmailFooter'

interface PaymentFailedEmailProps {
  storeName?: string
  planName?: string
  amount?: string
  billingUrl?: string
  gracePeriodDays?: number
}

export default function PaymentFailedEmail({
  storeName = 'Sitepow Store',
  planName = 'Pro Plan',
  amount = '฿790.00',
  billingUrl = '/',
  gracePeriodDays = 3,
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>การชำระเงินไม่สำเร็จ - {storeName}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              การชำระเงินไม่สำเร็จ
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              เราไม่สามารถตัดยอดชำระสำหรับการต่ออายุ {planName} ของร้าน{' '}
              {storeName} ได้
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ยอดเงินที่ค้างชำระ:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {amount}
            </Text>
            <Section className="my-6">
              <Link
                href={billingUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                อัปเดตข้อมูลการชำระเงิน
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">แพ็กเกจ</Text>
                <Text className="m-0 font-medium opacity-90">{planName}</Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">ระยะเวลาผ่อนผัน</Text>
                <Text className="m-0 font-medium opacity-90">
                  {gracePeriodDays} วัน
                </Text>
              </div>
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                กรุณาทำการอัปเดตบัตรหรือช่องทางชำระเงินภายใน {gracePeriodDays}{' '}
                วัน
                เพื่อหลีกเลี่ยงการถูกระงับการใช้งานฟีเจอร์ของแพ็กเกจเป็นการชั่วคราว
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
