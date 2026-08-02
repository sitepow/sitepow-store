import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { EmailFooter } from './_components/EmailFooter'

interface TwoFactorEmailProps {
  code?: string
  expiryMinutes?: number
}

export default function TwoFactorEmail({
  code = '849201',
  expiryMinutes = 5,
}: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>รหัสยืนยันตัวตนสองชั้น (2FA) ของคุณ</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              การยืนยันตัวตนสองชั้น
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              โปรดใช้รหัสความปลอดภัยด้านล่างนี้เพื่ออนุมัติการเข้าสู่ระบบ
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              รหัสความปลอดภัยของคุณ:
            </Text>
            <Text className="my-4 text-5xl font-semibold tracking-[8px]">
              {code}
            </Text>
            <Text className="text-sm opacity-50">
              รหัสนี้มีอายุการใช้งาน {expiryMinutes} นาที
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                หากคุณไม่ได้เป็นผู้พยายามเข้าสู่ระบบ
                โปรดตรวจสอบความปลอดภัยของบัญชีและเปลี่ยนรหัสผ่านของคุณทันที
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
