import { IndexedIndicator } from "../attach-indicators.interface"

export function pickIndexedIndicator<T>(value: T, index: number): IndexedIndicator<T> {
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined as IndexedIndicator<T>

    if (Array.isArray(value[0])) {
      return value.map(arr => arr[index]) as IndexedIndicator<T>
    } else {
      return value[index] as IndexedIndicator<T>
    }
  } else if (typeof value === "object" && value !== null) {
    const obj: Partial<Record<keyof T, unknown>> = {}

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        obj[key as keyof T] = pickIndexedIndicator(value[key], index)
      }
    }
    return obj as IndexedIndicator<T>
  } else {
    return value as IndexedIndicator<T>
  }
}
