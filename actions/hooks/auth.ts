'use client'

import { useMutation } from '@tanstack/react-query'

import {
  RequestOtpInput,
  ResetPasswordWithOtpInput,
  requestForgotPasswordOtp,
  resetPasswordWithOtp,
} from '../auth'

export function useRequestForgotPasswordOtp() {
  return useMutation({
    mutationFn: async (input: RequestOtpInput) => {
      return await requestForgotPasswordOtp(input)
    },
  })
}

export function useResetPasswordWithOtp() {
  return useMutation({
    mutationFn: async (input: ResetPasswordWithOtpInput) => {
      return await resetPasswordWithOtp(input)
    },
  })
}
