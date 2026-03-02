import { OHLCV, EMAParams } from "../indicators.interface"
import { DEFAULT_FIELD, DEFAULT_PERIOD } from "../indicators.constants"
import { calculateSMA } from "./sma.indicator"

export function calculateEMA(data: OHLCV[], params?: EMAParams) {
  const { period = DEFAULT_PERIOD, field = DEFAULT_FIELD } = params || {}
  const emaData: number[] = []
  const multiplier = 2 / (period + 1)

  let ema = calculateSMA(data.slice(0, period), { period, field })[0]
  emaData.push(ema)

  for (let i = period; i < data.length; i++) {
    ema = ((data[i][field] as number) - ema) * multiplier + ema
    emaData.push(ema)
  }

  return emaData
}
