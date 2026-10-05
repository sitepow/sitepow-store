import { IconLoader2 } from '@tabler/icons-react'

import { TableCell, TableRow } from '@/components/ui/table'

interface TableLoadingRowProps {
  colSpan: number
}

export function TableLoadingRow({ colSpan }: TableLoadingRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground py-14 text-center text-xs"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <IconLoader2 className="text-primary animate-spin" size={28} />
          <span className="text-foreground mt-1 font-semibold">
            กำลังเรียกดูข้อมูล...
          </span>
          <span className="text-muted-foreground text-[11px]">
            กรุณารอสักครู่ ระบบกำลังดึงรายการข้อมูลของคุณ
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}
