'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

export async function loginWithSocial(providerId: string) {
  try {
    await signIn(providerId, { redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Something went wrong with authentication.' }
    }
    throw error
  }
}
