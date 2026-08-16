import {
  type UpdateProfileInput,
  getProfile,
  updateProfile,
} from '@/actions/profile'
import { profileKeys } from '@/actions/query-keys/profile'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useProfile() {
  return useQuery(
    queryOptions({
      queryKey: profileKeys.detail(),
      queryFn: () => getProfile(),
    }),
  )
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}
