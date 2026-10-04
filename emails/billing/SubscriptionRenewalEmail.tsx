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

interface SubscriptionRenewalEmailProps {
  storeName?: string
  planName?: string
  billingCycle?: string
  amount?: string
  nextBillingDate?: string
  invoiceUrl?: string
}

export default function SubscriptionRenewalEmail({
  storeName = 'Sitepow Store',
  planName = 'Pro Plan',
  billingCycle = 'รายเดือน (Monthly)',
  amount = '฿790.00',
  nextBillingDate = '1 ก.ย. 2026',
  invoiceUrl = '/dashboard/settings/billing',
}: SubscriptionRenewalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        แจ้งเตือนการต่ออายุแพ็กเกจ {planName} - {storeName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ต่ออายุแพ็กเกจเรียบร้อย
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              การต่ออายุการใช้งานสำหรับร้าน {storeName} เสร็จสมบูรณ์แล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ยอดชำระบริการ:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {amount}
            </Text>
            <Text className="text-xs opacity-50">
              {planName} ({billingCycle})
            </Text>
            <Section className="my-8 text-left text-sm">
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">แพ็กเกจ</Text>
                <Text className="m-0 font-medium opacity-90">{planName}</Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">รอบการเรียกเก็บเงิน</Text>
                <Text className="m-0 font-medium opacity-90">
                  {billingCycle}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">รอบถัดไป</Text>
                <Text className="m-0 font-medium opacity-90">
                  {nextBillingDate}
                </Text>
              </div>
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="my-6">
              <Link
                href={invoiceUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ดูใบเสร็จ / จัดการแพ็กเกจ
              </Link>
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                ขอบคุณที่ใช้บริการของเรา
                หากต้องการเปลี่ยนแปลงแพ็กเกจหรือสอบถามเกี่ยวกับใบเสร็จ
                สามารถจัดการได้ผ่านหน้าการตั้งค่าร้านค้าได้ตลอดเวลา
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
