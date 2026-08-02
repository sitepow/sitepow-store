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

import { Footer } from './_components/Footer'

interface StoreInvoiceEmailProps {
  invoiceNumber?: string
  storeName?: string
  billingPeriod?: string
  amountDue?: string
  dueDate?: string
  paymentUrl?: string
}

export default function StoreInvoiceEmail({
  invoiceNumber = 'INV-202608-001',
  storeName = 'Sitepow Store',
  billingPeriod = '1 ส.ค. 2026 - 31 ส.ค. 2026',
  amountDue = '฿1,200.00',
  dueDate = '10 ส.ค. 2026',
  paymentUrl = '/',
}: StoreInvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        ใบแจ้งหนี้ค่าบริการร้านค้า #{invoiceNumber} - {storeName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ใบแจ้งหนี้ค่าบริการ
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              ใบแจ้งหนี้ค่าเช่าพื้นที่/บริการร้านค้า {storeName}{' '}
              ออกเรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ยอดที่ต้องชำระ:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {amountDue}
            </Text>
            <Text className="text-xs opacity-50">
              กำหนดชำระภายในวันที่ {dueDate}
            </Text>
            <Section className="my-6">
              <Link
                href={paymentUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ชำระเงิน / ดูรายละเอียด
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">เลขที่ใบแจ้งหนี้</Text>
                <Text className="m-0 font-medium opacity-90">
                  #{invoiceNumber}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">รอบการใช้งาน</Text>
                <Text className="m-0 font-medium opacity-90">
                  {billingPeriod}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">วันครบกำหนดชำระ</Text>
                <Text className="m-0 font-medium opacity-90">{dueDate}</Text>
              </div>
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                กรุณาชำระเงินตามกำหนดเพื่อการใช้งานร้านค้าอย่างต่อเนื่อง
                หากมีข้อสงสัยเกี่ยวกับใบแจ้งหนี้ฉบับนี้
                สามารถติดต่อฝ่ายบัญชีหรือศูนย์ช่วยเหลือได้ตลอดเวลา
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
