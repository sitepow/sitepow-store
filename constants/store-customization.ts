import { ComponentType } from 'react'

import { Image, LayoutTemplate, Palette, Video } from 'lucide-react'

export interface CustomizationFeature {
  title: string
  description: string
  icon?: ComponentType<{ className?: string; size?: number }>
}

export const CUSTOMIZATION_FEATURES: CustomizationFeature[] = [
  {
    title: 'ปรับแต่งสีร้านค้าตามใจชอบ',
    description:
      'สร้างตัวตนให้โดดเด่นด้วยการเลือกโทนสีร้านค้าให้เข้ากับแบรนด์ของคุณ ช่วยสร้างความจดจำและดึงดูดลูกค้าตั้งแต่วินาทีแรก',
    icon: Palette,
  },
  {
    title: 'รองรับไฟล์ภาพและวิดีโอ',
    description:
      'ใส่สื่อโฆษณาได้ทั้งภาพนิ่งและวิดีโอคมชัด รองรับไฟล์สูงสุด 10MB ต่อไฟล์ ให้คุณสื่อสารจุดเด่นสินค้าได้ชัดเจนยิ่งขึ้น',
    icon: Video,
  },
  {
    title: 'ออกแบบ Header & Navbar',
    description:
      'ปรับแต่งแถบเมนูและภาพหน้าปก (Navbar) ได้อย่างอิสระ ให้ร้านค้าของคุณมีสไตล์ที่เป็นมืออาชีพและใช้งานง่าย',
    icon: LayoutTemplate,
  },
  {
    title: 'คลังรูปภาพหมวดหมู่สินค้า',
    description:
      'ใส่รูปภาพประกอบแต่ละหมวดหมู่สินค้า เพื่อช่วยนำทางลูกค้าและเพิ่มความสวยงามให้กับหน้าร้านค้าออนไลน์ของคุณ',
    icon: Image,
  },
]
