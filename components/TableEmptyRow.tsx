import { IconAlertCircle } from '@tabler/icons-react'

import { TableCell, TableRow } from './ui/table'

interface TableEmptyRowProps {
  title: string
  description?: string
  colSpan: number
}

export function TableEmptyRow({
  title,
  description = 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาหรือฟิลเตอร์ของคุณในปัจจุบัน',
  colSpan,
}: TableEmptyRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground py-14 text-center text-xs"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <IconAlertCircle size={26} className="text-muted-foreground/40" />
          <span className="text-foreground mt-1 font-semibold">{title}</span>
          <span className="text-muted-foreground text-[11px]">
            {description}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}
