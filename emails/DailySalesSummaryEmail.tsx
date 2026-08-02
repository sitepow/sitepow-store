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

interface TopSellingItem {
  title: string
  quantity: number
  revenue: string
}

interface DailySalesSummaryEmailProps {
  storeName?: string
  date?: string
  totalRevenue?: string
  totalOrders?: number
  topItems?: TopSellingItem[]
  dashboardUrl?: string
}

export default function DailySalesSummaryEmail({
  storeName = 'Sitepow Store',
  date = '1 ส.ค. 2026',
  totalRevenue = '฿12,450.00',
  totalOrders = 18,
  topItems = [
    {
      title: 'เสื้อยืด Oversized Cotton 100%',
      quantity: 12,
      revenue: '฿4,680.00',
    },
    {
      title: 'กระเป๋าผ้า Canvas Bag',
      quantity: 8,
      revenue: '฿2,800.00',
    },
  ],
  dashboardUrl = '/',
}: DailySalesSummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        สรุปยอดขายประจำวัน {date} - {storeName}
      </Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              สรุปยอดขายประจำวัน
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              รายงานยอดขายประจำวันที่ {date} สำหรับร้าน {storeName}
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ยอดขายรวมวันนี้:
            </Text>
            <Text className="my-2 text-4xl font-semibold tracking-tight">
              {totalRevenue}
            </Text>
            <Text className="text-sm opacity-50">
              จำนวนคำสั่งซื้อทั้งหมด: {totalOrders} ออเดอร์
            </Text>
            <Section className="my-6">
              <Link
                href={dashboardUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ดูรายงานแบบเต็มใน Dashboard
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Text className="mb-3 text-center font-medium opacity-70">
                สินค้ายอดนิยมประจำวัน
              </Text>
              <Hr className="my-3 opacity-20" />
              {topItems.map((item, index) => (
                <div key={index} className="my-3 flex justify-between">
                  <div>
                    <Text className="m-0 font-medium opacity-90">
                      {item.title}
                    </Text>
                    <Text className="m-0 text-xs opacity-50">
                      ขายได้ {item.quantity} ชิ้น
                    </Text>
                  </div>
                  <Text className="m-0 font-medium opacity-80">
                    {item.revenue}
                  </Text>
                </div>
              ))}
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                อีเมลนี้แจ้งเตือนอัตโนมัติประจำวันเนื่องจากคุณเปิดใช้งานระบบรายงานสรุปยอดขาย
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
