import { DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, ZLMAParams } from "../indicators.interface"
import { calculateSMA } from "./sma.indicator"

export function calculateZLMA(data: OHLCV[], params?: ZLMAParams) {
  const { period = DEFAULT_PERIOD } = params || {}

  if (!data || data.length < period) {
    throw new Error("Not enough data to calculate ZLMA")
  }

  const smaData = calculateSMA(data, { period })
  const smaLag = [null, ...smaData.slice(0, -1)]
  const zlmaData = smaData.map((value, index) => {
    const lag = smaLag[index]
    return lag == null ? null : value + (value - lag)
  })

  return zlmaData
}
