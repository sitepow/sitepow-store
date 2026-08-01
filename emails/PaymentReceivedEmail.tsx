import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { Footer } from './_components/Footer'

interface PaymentReceivedEmailProps {
  receiptNumber?: string
  orderNumber?: string
  customerName?: string
  paymentMethod?: string
  paidAmount?: string
  paidAt?: string
}

export function PaymentReceivedEmail({
  receiptNumber = 'RCP-20260801-001',
  orderNumber = 'SP2058-29583-92984',
  customerName = 'คุณลูกค้า',
  paymentMethod = 'โอนเงินผ่านธนาคาร / PromptPay',
  paidAmount = '฿1,130.00',
  paidAt = '1 ส.ค. 2026 - 20:53 น.',
}: PaymentReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>ใบเสร็จรับเงินสำหรับการชำระเงิน #{orderNumber}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ได้รับชำระเงินเรียบร้อย
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              สวัสดี {customerName} เราได้รับชำระเงินของคุณเรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              จำนวนเงินที่ชำระ:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {paidAmount}
            </Text>
            <Section className="my-8 text-left text-sm">
              <Text className="mb-3 text-center font-medium opacity-70">
                รายละเอียดการชำระเงิน
              </Text>
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">เลขที่ใบเสร็จ</Text>
                <Text className="m-0 font-medium opacity-90">
                  #{receiptNumber}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">อ้างอิงคำสั่งซื้อ</Text>
                <Text className="m-0 font-medium opacity-90">
                  #{orderNumber}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">ช่องทางชำระเงิน</Text>
                <Text className="m-0 font-medium opacity-90">
                  {paymentMethod}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">วัน-เวลาที่ชำระ</Text>
                <Text className="m-0 font-medium opacity-90">{paidAt}</Text>
              </div>
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                อีเมลนี้ถือเป็นใบเสร็จรับเงินอิเล็กทรอนิกส์
                ขอบคุณที่ไว้วางใจใช้บริการของเรา
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PaymentReceivedEmail
