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

import { EmailFooter } from './_components/EmailFooter'

interface OrderItem {
  title: string
  variantTitle?: string
  quantity: number
  price: string
}

interface OrderConfirmationEmailProps {
  orderNumber?: string
  customerName?: string
  items?: OrderItem[]
  totalAmount?: string
  shippingFee?: string
  discountAmount?: string
}

export default function OrderConfirmationEmail({
  orderNumber = 'SP2058-29583-92984',
  customerName = 'คุณลูกค้า',
  items = [
    {
      title: 'เสื้อยืด Oversized Cotton 100%',
      variantTitle: 'สีดำ / L',
      quantity: 2,
      price: '฿780.00',
    },
    {
      title: 'กระเป๋าผ้า Canvas Bag',
      variantTitle: 'สีครีม',
      quantity: 1,
      price: '฿350.00',
    },
  ],
  totalAmount = '฿1,130.00',
  shippingFee = '฿50.00',
  discountAmount = '฿0.00',
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>ยืนยันการสั่งซื้อ หมายเลข #{orderNumber}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ขอบคุณสำหรับคำสั่งซื้อ
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              สวัสดี {customerName} เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              หมายเลขคำสั่งซื้อ:
            </Text>
            <Text className="my-2 text-xl font-semibold tracking-wider">
              #{orderNumber}
            </Text>
            <Section className="my-8 text-left text-sm">
              <Text className="mb-3 text-center font-medium opacity-70">
                รายการสินค้า
              </Text>
              <Hr className="my-3 opacity-20" />
              {items.map((item, index) => (
                <div key={index} className="my-3 flex justify-between">
                  <div>
                    <Text className="m-0 font-medium opacity-90">
                      {item.title}
                    </Text>
                    {item.variantTitle && (
                      <Text className="m-0 text-xs opacity-50">
                        {item.variantTitle} × {item.quantity}
                      </Text>
                    )}
                  </div>
                  <Text className="m-0 font-medium opacity-80">
                    {item.price}
                  </Text>
                </div>
              ))}
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between text-xs opacity-60">
                <Text className="m-0">ค่าจัดส่ง</Text>
                <Text className="m-0">{shippingFee}</Text>
              </div>
              {discountAmount !== '฿0.00' && (
                <div className="my-2 flex justify-between text-xs opacity-60">
                  <Text className="m-0">ส่วนลด</Text>
                  <Text className="m-0">-{discountAmount}</Text>
                </div>
              )}
              <Hr className="my-3 opacity-20" />
              <div className="my-2 flex justify-between text-base font-semibold opacity-90">
                <Text className="m-0">ยอดรวมทั้งหมด</Text>
                <Text className="m-0">{totalAmount}</Text>
              </div>
            </Section>

            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                เราจะแจ้งให้คุณทราบอีกครั้งเมื่อสินค้าของคุณจัดส่งเรียบร้อยแล้ว
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
