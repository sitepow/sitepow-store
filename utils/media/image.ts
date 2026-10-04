export function getPathR2FromUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    const decodedPath = decodeURIComponent(url.pathname)

    return decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath
  } catch {
    return ''
  }
}
