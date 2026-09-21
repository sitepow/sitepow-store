import { en } from '@blocknote/core/locales'

export const thDictionary: typeof en = {
  slash_menu: {
    heading: {
      title: 'หัวข้อ 1',
      subtext: 'ใช้สำหรับหัวข้อหลักขนาดใหญ่ที่สุด',
      aliases: ['h1', 'heading1', 'หัวข้อ', 'หัวข้อ1'],
      group: 'ข้อความ',
    },
    heading_2: {
      title: 'หัวข้อ 2',
      subtext: 'ใช้สำหรับหัวข้อรองขนาดกลาง',
      aliases: ['h2', 'heading2', 'หัวข้อ2'],
      group: 'ข้อความ',
    },
    heading_3: {
      title: 'หัวข้อ 3',
      subtext: 'ใช้สำหรับหัวข้อย่อยขนาดเล็ก',
      aliases: ['h3', 'heading3', 'หัวข้อ3'],
      group: 'ข้อความ',
    },
    heading_4: {
      title: 'หัวข้อ 4',
      subtext: 'ใช้สำหรับหัวข้อย่อยระดับที่ 4',
      aliases: ['h4', 'heading4'],
      group: 'ข้อความ',
    },
    heading_5: {
      title: 'หัวข้อ 5',
      subtext: 'ใช้สำหรับหัวข้อย่อยระดับที่ 5',
      aliases: ['h5', 'heading5'],
      group: 'ข้อความ',
    },
    heading_6: {
      title: 'หัวข้อ 6',
      subtext: 'ใช้สำหรับหัวข้อย่อยขนาดเล็กที่สุด',
      aliases: ['h6', 'heading6'],
      group: 'ข้อความ',
    },
    toggle_heading: {
      title: 'หัวข้อแบบพับได้ 1',
      subtext: 'หัวข้อใหญ่ที่สามารถซ่อนหรือแสดงเนื้อหาได้',
      aliases: ['toggle', 'toggle1', 'พับได้'],
      group: 'ข้อความ',
    },
    toggle_heading_2: {
      title: 'หัวข้อแบบพับได้ 2',
      subtext: 'หัวข้อรองที่สามารถซ่อนหรือแสดงเนื้อหาได้',
      aliases: ['toggle2'],
      group: 'ข้อความ',
    },
    toggle_heading_3: {
      title: 'หัวข้อแบบพับได้ 3',
      subtext: 'หัวข้อย่อยที่สามารถซ่อนหรือแสดงเนื้อหาได้',
      aliases: ['toggle3'],
      group: 'ข้อความ',
    },
    quote: {
      title: 'ข้อความอ้างอิง',
      subtext: 'สร้างบล็อกเน้นย้ำข้อความอ้างอิง',
      aliases: ['quote', 'อ้างอิง', 'คำพูด'],
      group: 'ข้อความ',
    },
    toggle_list: {
      title: 'รายการแบบพับได้',
      subtext: 'รายการย่อยที่ซ่อนหรือแสดงเนื้อหาได้',
      aliases: ['togglelist', 'รายการพับ'],
      group: 'ข้อความ',
    },
    numbered_list: {
      title: 'รายการตัวเลข',
      subtext: 'สร้างรายการแบบเรียงลำดับตัวเลข',
      aliases: ['numbered', 'list', 'ตัวเลข', 'รายการตัวเลข'],
      group: 'ข้อความ',
    },
    bullet_list: {
      title: 'รายการแบบจุด',
      subtext: 'สร้างรายการแบบไม่มีลำดับ',
      aliases: ['bullet', 'list', 'จุด', 'รายการจุด'],
      group: 'ข้อความ',
    },
    check_list: {
      title: 'สิ่งที่ต้องทำ',
      subtext: 'รายการพร้อมกล่องกาถูก (Checklist)',
      aliases: ['todo', 'checklist', 'เช็คลิสต์', 'สิ่งที่ต้องทำ'],
      group: 'ข้อความ',
    },
    paragraph: {
      title: 'ข้อความปกติ',
      subtext: 'เนื้อหาข้อความทั่วไป',
      aliases: ['p', 'paragraph', 'ข้อความ', 'ปกติ'],
      group: 'ข้อความ',
    },
    code_block: {
      title: 'บล็อกโค้ด',
      subtext: 'แสดงโค้ดโปรแกรมพร้อมไฮไลท์ไวยากรณ์',
      aliases: ['code', 'codeblock', 'โค้ด'],
      group: 'สื่อและไฟล์',
    },
    page_break: {
      title: 'ตัวแบ่งหน้า',
      subtext: 'แทรกจุดแบ่งหน้าเอกสาร',
      aliases: ['pagebreak', 'แบ่งหน้า'],
      group: 'เค้าโครง',
    },
    table: {
      title: 'ตาราง',
      subtext: 'สร้างตารางสำหรับตารางข้อมูล',
      aliases: ['table', 'ตาราง'],
      group: 'สื่อและไฟล์',
    },
    image: {
      title: 'รูปภาพ',
      subtext: 'อัปโหลดหรือฝังลิงก์รูปภาพ',
      aliases: ['image', 'img', 'picture', 'รูป', 'รูปภาพ'],
      group: 'สื่อและไฟล์',
    },
    video: {
      title: 'วิดีโอ',
      subtext: 'อัปโหลดหรือฝังลิงก์วิดีโอ',
      aliases: ['video', 'วิดีโอ'],
      group: 'สื่อและไฟล์',
    },
    audio: {
      title: 'ไฟล์เสียง',
      subtext: 'อัปโหลดหรือฝังลิงก์ไฟล์เสียง',
      aliases: ['audio', 'sound', 'เสียง', 'ไฟล์เสียง'],
      group: 'สื่อและไฟล์',
    },
    file: {
      title: 'ไฟล์',
      subtext: 'อัปโหลดไฟล์เอกสารแนบ',
      aliases: ['file', 'ไฟล์', 'แนบไฟล์'],
      group: 'สื่อและไฟล์',
    },
    emoji: {
      title: 'อิโมจิ',
      subtext: 'ค้นหาและแทรกสัญลักษณ์อิโมจิ',
      aliases: ['emoji', 'อิโมจิ'],
      group: 'สื่อและไฟล์',
    },
    divider: {
      title: 'เส้นคั่น',
      subtext: 'สร้างเส้นแนวนอนเพื่อแบ่งสัดส่วนเนื้อหา',
      aliases: ['divider', 'hr', 'เส้นคั่น', 'เส้น'],
      group: 'เค้าโครง',
    },
  },
  placeholders: {
    emptyDocument: "ป้อนข้อความหรือพิมพ์ '/' เพื่อใช้คำสั่ง",
    default: "พิมพ์ '/' เพื่อใช้คำสั่ง",
    heading: 'หัวข้อ',
    bulletListItem: 'รายการ',
    numberedListItem: 'รายการ',
    checkListItem: 'สิ่งที่ต้องทำ',
    new_comment: 'เขียนความคิดเห็น...',
    edit_comment: 'แก้ไขความคิดเห็น...',
    comment_reply: 'ตอบกลับความคิดเห็น...',
  },
  file_blocks: {
    add_button_text: {
      image: 'เพิ่มรูปภาพ',
      video: 'เพิ่มวิดีโอ',
      audio: 'เพิ่มไฟล์เสียง',
      file: 'เพิ่มไฟล์',
    },
  },
  toggle_blocks: {
    add_block_button: 'เพิ่มบล็อก',
  },
  side_menu: {
    add_block_label: 'เพิ่มบล็อกใหม่',
    drag_handle_label: 'เปิดเมนูบล็อก / ลากเพื่อย้าย',
  },
  drag_handle: {
    delete_menuitem: 'ลบ',
    colors_menuitem: 'สี',
    header_row_menuitem: 'แถวหัวข้อ',
    header_column_menuitem: 'คอลัมน์หัวข้อ',
  },
  table_handle: {
    delete_column_menuitem: 'ลบคอลัมน์',
    delete_row_menuitem: 'ลบแถว',
    add_left_menuitem: 'แทรกคอลัมน์ทางซ้าย',
    add_right_menuitem: 'แทรกคอลัมน์ทางขวา',
    add_above_menuitem: 'แทรกแถวด้านบน',
    add_below_menuitem: 'แทรกแถวด้านล่าง',
    split_cell_menuitem: 'แยกเซลล์',
    merge_cells_menuitem: 'รวมเซลล์',
    background_color_menuitem: 'สีพื้นหลังเซลล์',
  },
  suggestion_menu: {
    no_items_title: 'ไม่พบคำสั่งที่ตรงกัน',
  },
  color_picker: {
    text_title: 'สีข้อความ',
    background_title: 'สีพื้นหลัง',
    colors: {
      default: 'เริ่มต้น',
      gray: 'เทา',
      brown: 'น้ำตาล',
      red: 'แดง',
      orange: 'ส้ม',
      yellow: 'เหลือง',
      green: 'เขียว',
      blue: 'น้ำเงิน',
      purple: 'ม่วง',
      pink: 'ชมพู',
    },
  },
  formatting_toolbar: {
    bold: {
      tooltip: 'ตัวหนา',
      secondary_tooltip: 'Ctrl+B',
    },
    italic: {
      tooltip: 'ตัวเอียง',
      secondary_tooltip: 'Ctrl+I',
    },
    underline: {
      tooltip: 'ขีดเส้นใต้',
      secondary_tooltip: 'Ctrl+U',
    },
    strike: {
      tooltip: 'ขีดฆ่า',
      secondary_tooltip: 'Ctrl+Shift+X',
    },
    code: {
      tooltip: 'โค้ด',
      secondary_tooltip: 'Ctrl+E',
    },
    colors: {
      tooltip: 'เปลี่ยนสีข้อความและพื้นหลัง',
    },
    link: {
      tooltip: 'สร้างลิงก์',
      secondary_tooltip: 'Ctrl+K',
    },
    file_caption: {
      tooltip: 'คำอธิบายสื่อ',
      input_placeholder: 'ใส่คำอธิบายเพิ่มเติม...',
    },
    file_replace: {
      tooltip: {
        image: 'เปลี่ยนรูปภาพ',
        video: 'เปลี่ยนวิดีโอ',
        audio: 'เปลี่ยนไฟล์เสียง',
        file: 'เปลี่ยนไฟล์',
      },
    },
    file_rename: {
      tooltip: {
        image: 'เปลี่ยนชื่อรูปภาพ',
        video: 'เปลี่ยนชื่อวิดีโอ',
        audio: 'เปลี่ยนชื่อไฟล์เสียง',
        file: 'เปลี่ยนชื่อไฟล์',
      },
      input_placeholder: {
        image: 'กรอกชื่อรูปภาพ...',
        video: 'กรอกชื่อวิดีโอ...',
        audio: 'กรอกชื่อไฟล์เสียง...',
        file: 'กรอกชื่อไฟล์...',
      },
    },
    file_download: {
      tooltip: {
        image: 'ดาวน์โหลดรูปภาพ',
        video: 'ดาวน์โหลดวิดีโอ',
        audio: 'ดาวน์โหลดไฟล์เสียง',
        file: 'ดาวน์โหลดไฟล์',
      },
    },
    file_delete: {
      tooltip: {
        image: 'ลบรูปภาพ',
        video: 'ลบวิดีโอ',
        audio: 'ลบไฟล์เสียง',
        file: 'ลบไฟล์',
      },
    },
    file_preview_toggle: {
      tooltip: 'สลับการแสดงผลตัวอย่าง',
    },
    nest: {
      tooltip: 'เพิ่มย่อหน้า (Indent)',
      secondary_tooltip: 'Tab',
    },
    unnest: {
      tooltip: 'ลดย่อหน้า (Outdent)',
      secondary_tooltip: 'Shift+Tab',
    },
    align_left: {
      tooltip: 'จัดชิดซ้าย',
    },
    align_center: {
      tooltip: 'จัดกึ่งกลาง',
    },
    align_right: {
      tooltip: 'จัดชิดขวา',
    },
    align_justify: {
      tooltip: 'จัดเต็มความกว้าง',
    },
    table_cell_merge: {
      tooltip: 'รวมเซลล์',
    },
    comment: {
      tooltip: 'เพิ่มความคิดเห็น',
    },
  },
  file_panel: {
    upload: {
      title: 'อัปโหลดไฟล์',
      file_placeholder: {
        image: 'เลือกไฟล์รูปภาพ',
        video: 'เลือกไฟล์วิดีโอ',
        audio: 'เลือกไฟล์เสียง',
        file: 'เลือกไฟล์',
      },
      upload_error: 'เกิดข้อผิดพลาด ไม่สามารถอัปโหลดไฟล์ได้',
    },
    embed: {
      title: 'ฝังลิงก์ (Embed)',
      embed_button: {
        image: 'ฝังรูปภาพ',
        video: 'ฝังวิดีโอ',
        audio: 'ฝังไฟล์เสียง',
        file: 'ฝังไฟล์',
      },
      url_placeholder: 'วางลิงก์ URL ที่นี่...',
    },
  },
  link_toolbar: {
    delete: {
      tooltip: 'ลบลิงก์',
    },
    edit: {
      text: 'แก้ไขลิงก์',
      tooltip: 'แก้ไข',
    },
    open: {
      tooltip: 'เปิดลิงก์ในแท็บใหม่',
    },
    form: {
      title_placeholder: 'ชื่อลิงก์ที่แสดง',
      url_placeholder: 'วางลิงก์ URL',
    },
  },
  comments: {
    edited: 'แก้ไขแล้ว',
    save_button_text: 'บันทึก',
    cancel_button_text: 'ยกเลิก',
    deleted_reference_text: 'ความคิดเห็นนี้ถูกลบไปแล้ว',
    discard_pending_comment: 'ละทิ้งความคิดเห็นนี้',
    actions: {
      add_reaction: 'ใส่รีแอคชัน',
      resolve: 'ทำเสร็จสิ้น',
      reopen: 'เปิดอีกครั้ง',
      edit_comment: 'แก้ไขความคิดเห็น',
      delete_comment: 'ลบความคิดเห็น',
      more_actions: 'ตัวเลือกเพิ่มเติม',
    },
    reactions: {
      reacted_by: 'ใส่รีแอคชันโดย',
    },
    sidebar: {
      marked_as_resolved: 'ทำเสร็จสิ้นแล้ว',
      more_replies: (count: number) => `การตอบกลับอีก ${count} รายการ`,
    },
  },
  suggestion_changes: {
    formatting_change: 'การเปลี่ยนแปลงรูปแบบ',
    deleted: 'ถูกลบ',
    inserted_by: (users: string) => `เพิ่มโดย ${users}`,
    deleted_by: (users: string) => `ลบโดย ${users}`,
    formatting_change_by: (formats: string, users: string) =>
      `เปลี่ยนรูปแบบ (${formats}) โดย ${users}`,
  },
  generic: {
    ctrl_shortcut: 'Ctrl',
  },
}
