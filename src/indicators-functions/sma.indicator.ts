import { OHLCV, SMAParams } from "../indicators.interface"
import { DEFAULT_FIELD, DEFAULT_PERIOD } from "../indicators.constants"

export function calculateSMA(data: OHLCV[], params?: SMAParams) {
  const { period = DEFAULT_PERIOD, field = DEFAULT_FIELD } = params || {}
  const result: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j][field] as number
    }
    result.push(sum / period)
  }

  return result
}
