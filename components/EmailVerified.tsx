import { AlertCircleIcon } from 'lucide-react'

import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

export function EmailVerified() {
  return (
    <Alert className="w-full rounded-none shadow-none">
      <AlertCircleIcon />
      <AlertTitle className="text-orange-500">
        มีสิ่งที่ต้องดำเนินการตอนนี้
      </AlertTitle>
      <AlertDescription>
        โปรดกรอกรหัสยืนยันที่ส่งไปยังอีเมลของคุณเพื่อเปิดใช้งานบัญชี
        (หากไม่พบในกล่องขาเข้า โปรดตรวจสอบใน อีเมลขยะ หรือ ถังขยะ)
      </AlertDescription>
      <AlertAction>
        <Button variant="outline">ยืนยันอีเมล</Button>
      </AlertAction>
    </Alert>
  )
}
