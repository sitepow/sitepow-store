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

import { EmailFooter } from './_components/EmailFooter'

interface OrderShippedEmailProps {
  orderNumber?: string
  customerName?: string
  courierName?: string
  trackingNumber?: string
  trackingUrl?: string
}

export default function OrderShippedEmail({
  orderNumber = 'SP2058-29583-92984',
  customerName = 'คุณลูกค้า',
  courierName = 'Flash Express',
  trackingNumber = 'TH0123456789A',
  trackingUrl = 'https://flashexpress.co.th/tracking?se=TH0123456789A',
}: OrderShippedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>สินค้าของคุณถูกจัดส่งแล้ว #{orderNumber}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              สินค้าของคุณกำลังเดินทาง!
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              สวัสดี {customerName} พัสดุสำหรับคำสั่งซื้อ #{orderNumber}{' '}
              ได้ถูกจัดส่งเรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              เลขพัสดุของคุณ ({courierName}):
            </Text>
            <Text className="my-2 text-3xl font-semibold tracking-wider">
              {trackingNumber}
            </Text>
            <Section className="my-6">
              <Link
                href={trackingUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                เช็กสถานะพัสดุ
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">ผู้ขนส่ง</Text>
                <Text className="m-0 font-medium opacity-90">
                  {courierName}
                </Text>
              </div>
              <div className="my-2 flex justify-between">
                <Text className="m-0 opacity-60">หมายเลขคำสั่งซื้อ</Text>
                <Text className="m-0 font-medium opacity-90">
                  #{orderNumber}
                </Text>
              </div>
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                ระยะเวลาในการจัดส่งอาจใช้เวลา 1-3 วันทำการ
                หากมีข้อสงสัยเพิ่มเติมสามารถติดต่อศูนย์ช่วยเหลือได้ตลอดเวลา
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
