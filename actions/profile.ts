'use server'

import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  createdAt: true,
  isEmailVerified: true,
} satisfies Prisma.UserSelect

export type ProfileData = NonNullable<Awaited<ReturnType<typeof getProfile>>>

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: profileSelect,
  })

  if (!user) {
    throw new Error('ไม่พบข้อมูลโปรไฟล์')
  }

  return serializeDecimal(user)
}

export interface UpdateProfileInput {
  firstName: string
  lastName: string
  phone?: string
  image?: string
}

export async function updateProfile(input: UpdateProfileInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: fullName,
      phone: input.phone ?? null,
      ...(input.image !== undefined && { image: input.image }),
    },
    select: profileSelect,
  })

  return {
    success: true,
    message: 'บันทึกข้อมูลสำเร็จแล้ว',
    data: serializeDecimal(updated),
  }
}
