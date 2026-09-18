'use client'

import React from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'
import { formatCurrency } from '@/utils/pricing'
import {
  IconCreditCard,
  IconMapPin,
  IconShoppingCartCheck,
  IconTruckDelivery,
} from '@tabler/icons-react'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayoutCheckout } from '../_components/layout/checkout/Layout'
import { CartAddressSection } from './_components/CartAddressSection'
import { CartHeaderProgress } from './_components/CartHeaderProgress'
import { CartItemsList } from './_components/CartItemsList'
import { CartOrderReview } from './_components/CartOrderReview'
import { CartPaymentSection } from './_components/CartPaymentSection'
import { CartShippingSection } from './_components/CartShippingSection'
import {
  CheckoutStep,
  useStorefrontCheckout,
} from './_hooks/use-storefront-checkout'

const STEP_ICONS: Record<CheckoutStep, React.ElementType> = {
  address: IconMapPin,
  shipping: IconTruckDelivery,
  payment: IconCreditCard,
  review: IconShoppingCartCheck,
}

export default function StoreCartPage() {
  const isMounted = useIsMounted()
  const {
    store,
    items,
    summary,
    physicalItems,
    physicalGroups,
    selectedAddress,
    setSelectedAddress,
    addressOptions,
    selectedAddressData,
    selectedShipping,
    setSelectedShipping,
    shippingOptionsWithFees,
    selectedShippingData,
    selectedPayment,
    setSelectedPayment,
    paymentMethods,
    selectedPaymentData,
    activeSection,
    setUserSelectedSection,
    progressValue,
    getStepNumber,
    handleNextIncompleteStep,
    shippingFee,
    grandTotal,
    pointsDiscount,
    couponDiscount,
    appliedCoupon,
    currentCurrency,
    convert,
    isAuthenticated,
    isEmailUnverified,
    loginHref,
    handleCreateOrder,
    isSubmitting,
    removeItem,
    updateQuantity,
    sectionDescription,
    isDomesticThaiOrder,
  } = useStorefrontCheckout()

  if (!isMounted) return null

  return (
    <StoreLayoutCheckout>
      <SectionContainer>
        <div className="text-foreground grid w-full items-start gap-5 lg:grid-cols-12">
          <CartItemsList
            items={items}
            physicalGroups={physicalGroups}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
          />

          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-4">
            <CartHeaderProgress
              progressValue={progressValue}
              icon={STEP_ICONS[activeSection]}
              grandTotal={grandTotal}
              currentCurrency={currentCurrency}
              formatCurrency={formatCurrency}
              convert={convert}
              sectionDescription={sectionDescription}
            />

            {physicalItems.length > 0 && (
              <CartAddressSection
                stepNumber={getStepNumber('address')}
                isActive={activeSection === 'address'}
                isCompleted={Boolean(selectedAddressData)}
                isDisabled={!isAuthenticated}
                onEdit={() => setUserSelectedSection('address')}
                onContinue={handleNextIncompleteStep}
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
                addressOptions={addressOptions}
                selectedAddressData={selectedAddressData}
              />
            )}

            {physicalItems.length > 0 && (
              <CartShippingSection
                stepNumber={getStepNumber('shipping')}
                isActive={activeSection === 'shipping'}
                isCompleted={Boolean(selectedShipping)}
                isDisabled={!isAuthenticated}
                onEdit={() => setUserSelectedSection('shipping')}
                onContinue={handleNextIncompleteStep}
                selectedShipping={selectedShipping}
                onSelectShipping={setSelectedShipping}
                shippingOptions={shippingOptionsWithFees}
                selectedShippingData={selectedShippingData}
                formatCurrency={formatCurrency}
                convert={convert}
                currentCurrency={currentCurrency}
              />
            )}

            <CartPaymentSection
              stepNumber={getStepNumber('payment')}
              isActive={activeSection === 'payment'}
              isCompleted={Boolean(selectedPayment)}
              isDisabled={!isAuthenticated}
              onEdit={() => setUserSelectedSection('payment')}
              onContinue={handleNextIncompleteStep}
              selectedPayment={selectedPayment}
              onSelectPayment={setSelectedPayment}
              paymentMethods={paymentMethods}
              selectedPaymentData={selectedPaymentData}
              isDomesticThaiOrder={isDomesticThaiOrder}
            />

            <CartOrderReview
              primaryColor={store?.primaryColor}
              summary={summary}
              shippingFee={shippingFee}
              grandTotal={grandTotal}
              pointsDiscount={pointsDiscount}
              couponDiscount={couponDiscount}
              appliedCoupon={appliedCoupon}
              currentCurrency={currentCurrency}
              formatCurrency={formatCurrency}
              convert={convert}
              isAuthenticated={Boolean(isAuthenticated)}
              isEmailUnverified={isEmailUnverified}
              loginHref={loginHref}
              canPlaceOrder={activeSection === 'review' && items.length > 0}
              isSubmitting={isSubmitting}
              onPlaceOrder={handleCreateOrder}
            />
          </div>
        </div>
      </SectionContainer>
    </StoreLayoutCheckout>
  )
}
