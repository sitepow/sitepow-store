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

interface OrderItem {
  title: string
  quantity: number
  price: string
}

interface NewOrderNotificationEmailProps {
  orderNumber?: string
  storeName?: string
  customerName?: string
  totalAmount?: string
  paymentMethod?: string
  items?: OrderItem[]
  dashboardUrl?: string
}

export default function NewOrderNotificationEmail({
  orderNumber = 'SP2058-29583-92984',
  storeName = 'Sitepow Store',
  customerName = 'คุณลูกค้า',
  totalAmount = '฿1,130.00',
  paymentMethod = 'โอนเงินผ่านธนาคาร / PromptPay',
  items = [
    {
      title: 'เสื้อยืด Oversized Cotton 100%',
      quantity: 2,
      price: '฿780.00',
    },
    {
      title: 'กระเป๋าผ้า Canvas Bag',
      quantity: 1,
      price: '฿350.00',
    },
  ],
  dashboardUrl = '/',
}: NewOrderNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        มีออเดอร์ใหม่เข้ามา! #{orderNumber} - {storeName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              มีคำสั่งซื้อใหม่เข้ามา!
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              ร้านค้า {storeName} ได้รับคำสั่งซื้อใหม่จาก {customerName}
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ยอดรวมคำสั่งซื้อ:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {totalAmount}
            </Text>
            <Text className="text-xs opacity-50">
              หมายเลข: #{orderNumber} <br />
              {paymentMethod}
            </Text>
            <Section className="my-6">
              <Link
                href={dashboardUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ดูและจัดการคำสั่งซื้อ
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Text className="mb-3 text-center font-medium opacity-70">
                สรุปรายการสินค้า
              </Text>
              <Hr className="my-3 opacity-20" />
              {items.map((item, index) => (
                <div key={index} className="my-3 flex justify-between">
                  <Text className="m-0 font-medium opacity-90">
                    {item.title} × {item.quantity}
                  </Text>
                  <Text className="m-0 font-medium opacity-80">
                    {item.price}
                  </Text>
                </div>
              ))}
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                อีเมลนี้แจ้งเตือนไปยังเจ้าของร้านและพนักงานที่ได้รับสิทธิ์ดูแลคำสั่งซื้อ
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
