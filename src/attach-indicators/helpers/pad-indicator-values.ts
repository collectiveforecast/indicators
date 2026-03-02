export function padIndicatorValues<T>(values: T, targetLength: number): T {
  if (Array.isArray(values)) {
    const diff = targetLength - values.length

    if (diff > 0) {
      return [...Array(diff).fill(undefined), ...values] as unknown as T
    }

    return values
  } else if (typeof values === "object" && values !== null) {
    const paddedObj = {} as { [K in keyof T]: T[K] }

    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        paddedObj[key] = padIndicatorValues(values[key], targetLength)
      }
    }
    return paddedObj
  } else {
    return values
  }
}
