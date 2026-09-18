import {
  GetExpensesParams,
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '@/actions/expense'
import { expenseKeys } from '@/actions/query-keys/expenses'
import { CreateExpenseInput, UpdateExpenseInput } from '@/zod/expense'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

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
