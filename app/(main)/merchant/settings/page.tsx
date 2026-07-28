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
    canViewStoreProfile,
    canViewSecurity,
    canViewNotifications,
    canViewTransferStore,
    canViewTax,
    canViewShipping,
    canViewPayment,
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
            <TabsTrigger value="store-profile">
              <IconBuildingStore size={14} /> ตั้งค่าข้อมูลร้านค้า
            </TabsTrigger>
            <TabsTrigger value="security">
              <IconLock size={14} /> ความปลอดภัยบัญชี
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <IconBell size={14} /> ระบบแจ้งเตือนไลน์/อีเมล
            </TabsTrigger>
            <TabsTrigger value="settings-transfer">
              <IconReplace size={14} /> โอนความเป็นเจ้าของร้าน
            </TabsTrigger>
            <TabsTrigger value="settings-tax">
              <IconReceiptTax size={14} /> ภาษีและใบกำกับ
            </TabsTrigger>
            <TabsTrigger value="settings-shipping">
              <IconTruck size={14} /> ระบบขนส่งสินค้า
            </TabsTrigger>
            <TabsTrigger value="settings-payment">
              <IconCreditCard size={14} /> ช่องทางรับชำระเงิน
            </TabsTrigger>
          </TabsList>
          <TabsContent value="store-profile" className="flex-1">
            {!isPermissionLoading && !canViewStoreProfile ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลร้านค้าของสาขาหรือร้านค้านี้"
              />
            ) : (
              <StoreProfileForm />
            )}
          </TabsContent>
          <TabsContent value="security" className="flex-1">
            {!isPermissionLoading && !canViewSecurity ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลความปลอดภัยบัญชีของสาขาหรือร้านค้านี้"
              />
            ) : (
              <SecuritySettingsForm />
            )}
          </TabsContent>
          <TabsContent value="notifications" className="flex-1">
            {!isPermissionLoading && !canViewNotifications ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลระบบแจ้งเตือนของสาขาหรือร้านค้านี้"
              />
            ) : (
              <NotificationSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-transfer" className="flex-1">
            {!isPermissionLoading && !canViewTransferStore ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลการโอนความเป็นเจ้าของร้านของสาขาหรือร้านค้านี้"
              />
            ) : (
              <StoreTransferSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-tax" className="flex-1">
            {!isPermissionLoading && !canViewTax ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลภาษีและใบกำกับของสาขาหรือร้านค้านี้"
              />
            ) : (
              <TaxSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-shipping" className="flex-1">
            {!isPermissionLoading && !canViewShipping ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลระบบขนส่งสินค้าของสาขาหรือร้านค้านี้"
              />
            ) : (
              <ShippingSettingsForm />
            )}
          </TabsContent>
          <TabsContent value="settings-payment" className="flex-1">
            {!isPermissionLoading && !canViewPayment ? (
              <ActionRequiredAlert
                icon={<IconLock />}
                title="ไม่มีสิทธิ์เข้าถึง"
                description="คุณไม่มีสิทธิ์ในการดูข้อมูลช่องทางรับชำระเงินของสาขาหรือร้านค้านี้"
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
