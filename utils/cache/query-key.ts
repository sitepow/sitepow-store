export function queryKeyToRedisKey(key: readonly unknown[]): string {
  return key
    .map((part) => {
      if (typeof part === 'object' && part !== null) {
        const sortedObject = Object.keys(part)
          .sort()
          .reduce((obj, k) => {
            obj[k as keyof typeof part] = part[k as keyof typeof part]
            return obj
          }, {})
        return JSON.stringify(sortedObject)
      }
      return String(part)
    })
    .join(':')
}
