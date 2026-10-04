import {
  type UpdateProfileInput,
  getProfile,
  updateProfile,
} from '@/actions/account/profile/actions'
import { profileKeys } from '@/actions/account/profile/query-keys'
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
