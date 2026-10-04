import {
  GetExpensesParams,
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '@/actions/finance/expense/actions'
import { CreateExpenseInput, UpdateExpenseInput } from '@/zod/finance/expense'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: GetExpensesParams) =>
    [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
}

export function useExpenses(params: GetExpensesParams) {
  return useQuery(
    queryOptions({
      queryKey: expenseKeys.list(params),
      queryFn: async () => await getExpenses(params),
      enabled: !!params.storeId,
      placeholderData: (prev) => prev,
    }),
  )
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateExpenseInput) =>
      await createExpense(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      }
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateExpenseInput) =>
      await updateExpense(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      }
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      expenseId,
      storeId,
    }: {
      expenseId: string
      storeId: string
    }) => await deleteExpense(expenseId, storeId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      }
    },
  })
}
