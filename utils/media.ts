export function isVideoUrl(url?: string | null): boolean {
  if (!url) {
    return false
  }

  return Boolean(url.match(/\.(mp4|webm|ogg)$/i))
}
