import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    storeId: string
    orderId: string
    docType: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { orderId, docType } = await params

  const redirectUrl = new URL(
    `/merchant/orders/${orderId}/print?type=${docType}`,
    request.url,
  )

  return NextResponse.redirect(redirectUrl)
}
