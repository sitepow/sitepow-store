const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CloudflareCustomHostnameResult {
  id: string
  hostname: string
  ssl?: {
    status?: string
    method?: string
    type?: string
  }
  status?: string
  verification_errors?: string[]
}

export interface CloudflareApiResponse<T = unknown> {
  success: boolean
  errors?: Array<{ code: number; message: string }>
  messages?: string[]
  result?: T
}

export async function getCloudflareCustomHostname(
  domain: string,
): Promise<CloudflareCustomHostnameResult | null> {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) return null

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(domain)}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      },
    )

    const data: CloudflareApiResponse<CloudflareCustomHostnameResult[]> =
      await res.json()

    if (data.success && data.result && data.result.length > 0) {
      return data.result[0]
    }
    return null
  } catch (error) {
    console.error('Error fetching custom hostname from Cloudflare:', error)
    return null
  }
}

async function postCustomHostname(domain: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: JSON.stringify({
        hostname: domain,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            min_tls_version: '1.2',
          },
        },
      }),
    },
  )

  const data: CloudflareApiResponse<CloudflareCustomHostnameResult> =
    await res.json()
  return data
}

export async function addCloudflareCustomHostname(domain: string) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Cloudflare credentials missing')
    return null
  }

  try {
    const data = await postCustomHostname(domain)

    const isAlreadyExists =
      !data.success &&
      data.errors?.some(
        (e) =>
          e.code === 1406 ||
          e.message?.toLowerCase().includes('already exists'),
      )

    if (isAlreadyExists) {
      const existing = await getCloudflareCustomHostname(domain)
      if (existing?.id) {
        await deleteCloudflareCustomHostnameById(existing.id)
        return await postCustomHostname(domain)
      }
    }

    return data
  } catch (error) {
    console.error('Error adding custom hostname to Cloudflare:', error)
    return null
  }
}

async function deleteCloudflareCustomHostnameById(id: string) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) return null

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      },
    )
    return (await res.json()) as CloudflareApiResponse<{ id: string }>
  } catch (error) {
    console.error(
      'Error deleting custom hostname by ID from Cloudflare:',
      error,
    )
    return null
  }
}

export async function deleteCloudflareCustomHostname(domainOrId: string) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) return null

  try {
    if (UUID_REGEX.test(domainOrId)) {
      return await deleteCloudflareCustomHostnameById(domainOrId)
    }

    const existing = await getCloudflareCustomHostname(domainOrId)
    if (!existing || !existing.id) {
      return {
        success: true,
        messages: ['Custom hostname not found in Cloudflare, already removed'],
      }
    }

    return await deleteCloudflareCustomHostnameById(existing.id)
  } catch (error) {
    console.error('Error deleting custom hostname from Cloudflare:', error)
    return null
  }
}
