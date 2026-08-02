import { Hr, Link, Text } from '@react-email/components'

export function EmailFooter() {
  return (
    <>
      <Hr className="my-6" />
      <div className="mb-3 flex flex-wrap justify-center gap-1 text-[11px]">
        <Link href="/" className="underline">
          นโยบายความเป็นส่วนตัว
        </Link>
        <Link href="/" className="underline">
          เงื่อนไขการใช้งาน
        </Link>
        <Link href="/" className="underline">
          ศูนย์ช่วยเหลือ
        </Link>
      </div>
      <Text className="m-0 text-[11px] leading-4 opacity-40">
        ข้อความนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้
      </Text>
    </>
  )
}
