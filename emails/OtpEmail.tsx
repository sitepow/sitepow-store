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

import { Footer } from './_components/Footer'

interface OtpEmailProps {
  otp?: string
  expiryMinutes?: number
}

export function OtpEmail({ otp = '321045', expiryMinutes = 5 }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>รหัสยืนยัน OTP สำหรับการเปิดใช้งานบัญชีของคุณ</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ยืนยันอีเมลของคุณ
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              โปรดใช้รหัส OTP ด้านล่างนี้เพื่อเปิดใช้งานบัญชีของคุณ
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-1 text-sm font-medium opacity-70">
              รหัสยืนยันตัวตนของคุณ:
            </Text>
            <Text className="my-4 text-5xl font-semibold tracking-[8px]">
              {otp}
            </Text>
            <Text className="text-sm opacity-50">
              รหัสนี้มีอายุการใช้งาน {expiryMinutes} นาที
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                หากคุณไม่ได้เป็นผู้ลงทะเบียนหรือขอรหัสนี้
                สามารถข้ามหรือลบอีเมลนี้ได้ทันที
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default OtpEmail
