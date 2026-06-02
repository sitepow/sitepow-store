'use client'

import { useState } from 'react'

import { COURIERS_LIST, WeightRate, ZoneRate } from '@/types/shipping'
import { IconDeviceFloppy, IconLoader2, IconTruck } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { ServiceConfigDialog } from './_components/ServiceConfigDialog'

export function ShippingSettingsForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [freeShipMin, setFreeShipMin] = useState('999')

  const [enabledServices, setEnabledServices] = useState<{
    [key: string]: boolean
  }>({
    'cs-ems': true,
    'cs-reg': true,
    'cs-flash-std': true,
    'cs-flash-blk': false,
    'cs-jnt-std': true,
  })

  const [servicesConfigs, setServicesConfigs] = useState<{
    [key: string]: { weightRates: WeightRate[]; zoneRates: ZoneRate[] }
  }>({})

  const handleToggleService = (serviceId: string, checked: boolean) => {
    setEnabledServices((prev) => ({ ...prev, [serviceId]: checked }))
  }

  const handleSaveServiceConfig = (
    serviceId: string,
    config: { weightRates: WeightRate[]; zoneRates: ZoneRate[] },
  ) => {
    setServicesConfigs((prev) => ({ ...prev, [serviceId]: config }))
    console.log(`Updated config for service ${serviceId}:`, config)
  }

  const handleSave = () => {
    setIsSaving(true)

    const payload = {
      freeShipMin: parseFloat(freeShipMin) || 0,
      services: Object.keys(enabledServices).map((serviceId) => ({
        courierServiceId: serviceId,
        isEnabled: enabledServices[serviceId],
        weightRates: servicesConfigs[serviceId]?.weightRates || [],
        zoneRates: servicesConfigs[serviceId]?.zoneRates || [],
      })),
    }

    console.log('Sending to Prisma backend:', payload)

    setTimeout(() => {
      setIsSaving(false)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconTruck}
          title="ช่องทางและตัวเลือกการจัดส่งพัสดุ"
          description="ตั้งค่าบริการบริษัทขนส่ง พร้อมกำหนดอัตราค่าส่งขั้นบันไดและเงื่อนไขพื้นที่ห่างไกลแยกรายบริการอย่างเป็นระบบ"
        />
      </CardHeader>

      <CardContent className="divide-border divide-y">
        <div className="space-y-5 py-5">
          <div>
            <span className="block text-sm font-semibold text-neutral-900">
              ตัวเลือกผู้ให้บริการจัดส่งและบริการย่อย (Courier & Services)
            </span>
            <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
              เปิด-ปิด และระบุอัตราค่าบริการของแต่ละบริการย่อย
              (แอดมินหรือพนักงานจะเป็นผู้คีย์เลข Tracking
              ในระบบหลังบ้านเองหลังส่งสินค้าเสร็จ)
            </span>
          </div>

          <div className="space-y-6 pt-2">
            {COURIERS_LIST.map((courier) => (
              <div
                key={courier.id}
                className="space-y-3 rounded-xl border bg-neutral-50/40 p-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {courier.name}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {courier.description}
                  </p>
                </div>

                <div className="border-muted flex flex-col gap-2.5">
                  {courier.services.map((service) => {
                    const isEnabled = !!enabledServices[service.id]
                    return (
                      <div
                        key={service.id}
                        className={`flex items-center justify-between rounded-lg border bg-white p-3 transition-colors ${
                          isEnabled ? 'border-brand/20 bg-brand/5' : ''
                        }`}
                      >
                        <div>
                          <span className="block text-sm font-medium">
                            {service.name}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            ระยะเวลาโดยประมาณ: {service.estimatedDays}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isEnabled && (
                            <ServiceConfigDialog
                              serviceName={`${courier.name} - ${service.name}`}
                              onSave={(config) =>
                                handleSaveServiceConfig(service.id, config)
                              }
                            />
                          )}
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) =>
                              handleToggleService(service.id, checked)
                            }
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 py-5">
          <span className="block text-sm font-semibold text-neutral-900">
            เงื่อนไขโปรโมชันส่งฟรีของร้าน
          </span>
          <Field>
            <FieldLabel>ยอดซื้อรวมขั้นต่ำเพื่อส่งฟรี</FieldLabel>
            <div className="mt-1 flex items-center">
              <Input
                id="ship-free-min"
                type="number"
                placeholder="1000"
                value={freeShipMin}
                onChange={(e) => setFreeShipMin(e.target.value)}
                className="rounded-r-none"
              />
              <span className="border-input bg-muted text-muted-foreground flex h-9 items-center rounded-r-md border border-l-0 px-3 text-sm select-none">
                บาท
              </span>
            </div>
          </Field>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />{' '}
              กำลังบันทึกเกณฑ์ขนส่งระบบ...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> บันทึกเกณฑ์การส่งสินค้า
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
