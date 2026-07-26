'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBell,
  IconBuildingStore,
  IconCreditCard,
  IconLock,
  IconReceiptTax,
  IconReplace,
  IconSettings,
  IconTruck,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PaymentSettingsForm } from './_components/PaymentSettingsForm'
import { SecuritySettingsForm } from './_components/SecuritySettingsForm'
import { ShippingSettingsForm } from './_components/ShippingSettingsForm'
import { StoreProfileForm } from './_components/StoreProfileForm'
import { StoreTransferSettingsForm } from './_components/StoreTransferSettingsForm'
import { TaxSettingsForm } from './_components/TaxSettingsForm'

export default function MerchantSettingsPage() {
  const { selectedStoreId } = useStoreFilter()
  const {
    canManageStoreProfile,
    canManageSecurity,
    canManageNotifications,
    canTransferStore,
    canManageTax,
    canManageShipping,
    canManagePayment,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title="การตั้งค่าระบบ"
        description="จัดการข้อมูลโครงสร้างร้านค้าหลัก ปรับปรุงระบบความปลอดภัยชั้นสูง และควบคุมตัวเลือกแจ้งเตือนผ่านบัญชี"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : (
        <Tabs
          defaultValue="store-profile"
          orientation="vertical"
          className="flex flex-col gap-6 xl:flex-row"
        >
          <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
            {(canManageStoreProfile ?? true) && (
              <TabsTrigger value="store-profile">
                <IconBuildingStore size={14} /> ตั้งค่าข้อมูลร้านค้า
              </TabsTrigger>
            )}
            {(canManageSecurity ?? true) && (
              <TabsTrigger value="security">
                <IconLock size={14} /> ความปลอดภัยบัญชี
              </TabsTrigger>
            )}
            {(canManageNotifications ?? true) && (
              <TabsTrigger value="notifications">
                <IconBell size={14} /> ระบบแจ้งเตือนไลน์/อีเมล
              </TabsTrigger>
            )}
            {(canTransferStore ?? true) && (
              <TabsTrigger value="settings-transfer">
                <IconReplace size={14} /> โอนความเป็นเจ้าของร้าน
              </TabsTrigger>
            )}
            {(canManageTax ?? true) && (
              <TabsTrigger value="settings-tax">
                <IconReceiptTax size={14} /> ภาษีและใบกำกับ
              </TabsTrigger>
            )}
            {(canManageShipping ?? true) && (
              <TabsTrigger value="settings-shipping">
                <IconTruck size={14} /> ระบบขนส่งสินค้า
              </TabsTrigger>
            )}
            {(canManagePayment ?? true) && (
              <TabsTrigger value="settings-payment">
                <IconCreditCard size={14} /> ช่องทางรับชำระเงิน
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="store-profile" className="flex-1">
            {!isPermissionLoading && canManageStoreProfile === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลร้านค้าของสาขาหรือร้านค้านี้"
              />
            ) : (
              <StoreProfileForm />
            )}
          </TabsContent>
          <TabsContent value="security" className="flex-1">
            {!isPermissionLoading && canManageSecurity === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการความปลอดภัยบัญชีของสาขาหรือร้านค้านี้"
              />
            ) : (
              <SecuritySettingsForm />
            )}
          </TabsContent>
          <TabsContent value="notifications" className="flex-1">
            {!isPermissionLoading && canManageNotifications === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการระบบแจ้งเตือนของสาขาหรือร้านค้านี้"
              />
            ) : (
              <NotificationSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-transfer" className="flex-1">
            {!isPermissionLoading && canTransferStore === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการโอนความเป็นเจ้าของร้านของสาขาหรือร้านค้านี้"
              />
            ) : (
              <StoreTransferSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-tax" className="flex-1">
            {!isPermissionLoading && canManageTax === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการภาษีและใบกำกับของสาขาหรือร้านค้านี้"
              />
            ) : (
              <TaxSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-shipping" className="flex-1">
            {!isPermissionLoading && canManageShipping === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการระบบขนส่งสินค้าของสาขาหรือร้านค้านี้"
              />
            ) : (
              <ShippingSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-payment" className="flex-1">
            {!isPermissionLoading && canManagePayment === false ? (
              <ActionRequiredAlert
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการจัดการช่องทางรับชำระเงินของสาขาหรือร้านค้านี้"
              />
            ) : (
              <PaymentSettingsForm />
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardSidebar>
  )
}
