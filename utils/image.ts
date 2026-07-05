export function getPathR2FromUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
  } catch {
    return ''
  }
}
