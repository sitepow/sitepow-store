'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useCreateEmployee,
  useEmployee,
  useUpdateEmployee,
} from '@/actions/hooks/employee'
import { usePermissions, useRoleOptions } from '@/actions/hooks/role'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  getPresetPermissionIds,
  mapEmployeeDataToFormValues,
} from '@/utils/employee'
import {
  CreateEmployeeFormValues,
  createEmployeeSchema,
} from '@/zod/employee'

const DEFAULT_VALUES: CreateEmployeeFormValues = {
  name: '',
  email: '',
  assignments: [],
}

interface UseEmployeeDialogFormProps {
  employeeId?: string
  open: boolean
  setOpen: (v: boolean) => void
}

export function useEmployeeDialogForm({
  employeeId,
  open,
  setOpen,
}: UseEmployeeDialogFormProps) {
  const { currentStore, store } = useCurrentStore()
  const { selectedStoreId } = useStoreFilter()
  const createEmployeeMutation = useCreateEmployee()
  const updateEmployeeMutation = useUpdateEmployee()
  const { data: branches = [] } = useBranchOptions(selectedStoreId)
  const { data: roles = [] } = useRoleOptions(selectedStoreId)
  const { data: allPermissions = [] } = usePermissions()

  const { data: employeeData } = useEmployee(employeeId!)

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assignments',
  })

  useEffect(() => {
    if (open) {
      if (employeeData && allPermissions.length > 0) {
        reset(mapEmployeeDataToFormValues(employeeData))
      } else if (!employeeId) {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, employeeData, allPermissions, employeeId, reset])

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    setOpen(false)
  }

  const handleReset = () => {
    reset(mapEmployeeDataToFormValues(employeeData))
  }

  const handleRoleChange = (index: number, roleId: string) => {
    setValue(`assignments.${index}.roleId`, roleId, {
      shouldValidate: true,
    })

    const selectedRole = roles.find((r) => r.id === roleId)
    if (selectedRole?.name) {
      const presetPermissionIds = getPresetPermissionIds(
        selectedRole.name,
        allPermissions,
      )

      setValue(`assignments.${index}.permissionIds`, presetPermissionIds, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const onSubmit = (values: CreateEmployeeFormValues) => {
    const formattedAssignments = (values.assignments || []).map((a) => ({
      branchId: a.branchId,
      roleId: a.roleId,
      permissionIds: a.permissionIds || [],
    }))

    if (employeeId) {
      updateEmployeeMutation.mutate(
        {
          id: employeeId,
          input: {
            storeId: selectedStoreId,
            name: values.name,
            assignments: formattedAssignments,
          },
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    } else {
      createEmployeeMutation.mutate(
        {
          storeId: selectedStoreId,
          name: values.name,
          email: values.email ?? '',
          assignments: formattedAssignments,
        },
        {
          onSuccess: () => handleClose(),
        },
      )
    }
  }

  const assignments = (watch('assignments') ?? []) as {
    branchId: string
    roleId: string
    permissionIds?: string[]
  }[]
  const isPending =
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending

  const permissionOptions = allPermissions.map((p) => ({
    id: p.id,
    name: `${p.domain}_${p.action}`,
  }))

  const availableBranches = branches.filter(
    (b) => !assignments.some((a: { branchId: string }) => a.branchId === b.id),
  )

  return {
    currentStore,
    store,
    form,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isDirty,
    isPending,
    fields,
    append,
    remove,
    assignments,
    branches,
    roles,
    permissionOptions,
    availableBranches,
    setValue,
    handleRoleChange,
    handleClose,
    handleReset,
  }
}
