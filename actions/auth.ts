'use server'

import { AuthError } from 'next-auth'

import { signIn, signOut } from '@/auth'
import { LoginFormInputs } from '@/types/login'
import { RegisterFormInputs } from '@/types/register'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export async function logout() {
  try {
    await signOut({
      redirectTo: '/',
      redirect: true,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('เกิดข้อผิดพลาดในการออกจากระบบ')
    }

    throw error
  }
}

export async function loginWithSocial(providerId: string) {
  try {
    await signIn(providerId, { redirectTo: '/' })
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์')
    }

    throw error
  }
}

export async function loginWithCredentials(values: LoginFormInputs) {
  const { email, password } = values

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        default:
          throw new Error('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์')
      }
    }

    throw error
  }
}

export async function registerWithCredentials(values: RegisterFormInputs) {
  const { email, password, confirmPassword } = values

  if (password !== confirmPassword) {
    throw new Error('รหัสผ่านตรงกัน')
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว')
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('เกิดข้อผิดพลาดในการสมัครสมาชิก')
    }

    throw error
  }
}
