const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

export async function addCloudflareCustomHostname(domain: string) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Cloudflare credentials missing')
    return null
  }

  try {
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

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error adding custom hostname to Cloudflare:', error)
    return null
  }
}

export async function deleteCloudflareCustomHostname(hostnameId: string) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) return null

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      },
    )
    return await res.json()
  } catch (error) {
    console.error('Error deleting custom hostname from Cloudflare:', error)
    return null
  }
}
