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

import { Footer } from './_components/Footer'

interface StaffInvitationEmailProps {
  storeName?: string
  inviterName?: string
  roleName?: string
  inviteLink?: string
  expiryDays?: number
}

export function StaffInvitationEmail({
  storeName = 'Sitepow Store',
  inviterName = 'เจ้าของร้าน',
  roleName = 'ผู้จัดการร้าน (Manager)',
  inviteLink = '/',
  expiryDays = 7,
}: StaffInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>คุณได้รับคำเชิญให้เข้าร่วมทีม {storeName}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              คำเชิญเข้าร่วมทีม
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              {inviterName} ได้เชิญคุณเข้าร่วมทำงานในร้าน {storeName}
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              ตำแหน่งของคุณ:
            </Text>
            <Text className="my-2 text-xl font-semibold tracking-wide opacity-90">
              {roleName}
            </Text>
            <Section className="my-6">
              <Link
                href={inviteLink}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                ตอบรับคำเชิญเข้าร่วมทีม
              </Link>
            </Section>
            <Text className="text-sm opacity-50">
              คำเชิญนี้มีอายุการใช้งาน {expiryDays} วัน
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                หากคุณไม่ได้คาดว่าจะได้รับคำเชิญนี้ หรือคิดว่าเป็นข้อผิดพลาด
                สามารถข้ามหรือลบอีเมลนี้ได้อย่างปลอดภัย
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default StaffInvitationEmail
