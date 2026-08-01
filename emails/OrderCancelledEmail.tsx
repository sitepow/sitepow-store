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

interface OrderCancelledEmailProps {
  orderNumber?: string
  customerName?: string
  reason?: string
  refundStatus?: string
}

export function OrderCancelledEmail({
  orderNumber = 'SP2058-29583-92984',
  customerName = 'คุณลูกค้า',
  reason = 'ยกเลิกตามคำขอของลูกค้า',
  refundStatus = 'ดำเนินการคืนเงินเต็มจำนวนเข้าสู่ช่องทางเดิมภายใน 3-5 วันทำการ',
}: OrderCancelledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>แจ้งยกเลิกคำสั่งซื้อ #{orderNumber}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              คำสั่งซื้อถูกยกเลิกแล้ว
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              สวัสดี {customerName} คำสั่งซื้อ #{orderNumber}{' '}
              ของคุณได้ถูกยกเลิกเรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              หมายเลขคำสั่งซื้อที่ยกเลิก:
            </Text>
            <Text className="my-2 text-2xl font-semibold tracking-wider">
              #{orderNumber}
            </Text>
            <Section className="my-8 text-left text-sm">
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">สาเหตุการยกเลิก</Text>
                <Text className="m-0 font-medium opacity-90">{reason}</Text>
              </div>
              {refundStatus && (
                <div className="my-2 flex justify-between">
                  <Text className="m-0 opacity-60">สถานะการคืนเงิน</Text>
                  <Text className="m-0 max-w-50 text-right font-medium opacity-90">
                    {refundStatus}
                  </Text>
                </div>
              )}
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                หากคุณไม่ได้เป็นผู้ขอทำรายการนี้
                หรือมีข้อสงสัยเกี่ยวกับยอดเงินคืน
                โปรดติดต่อศูนย์ช่วยเหลือได้ทันที
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default OrderCancelledEmail
