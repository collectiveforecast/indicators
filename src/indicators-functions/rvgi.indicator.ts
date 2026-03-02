import { DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, RVGIParams } from "../indicators.interface"
import { calculateSMA } from "./sma.indicator"

export function calculateRVGI(data: OHLCV[], params?: RVGIParams) {
  const { period = DEFAULT_PERIOD } = params || {}

  if (!data || data.length < period) {
    throw new Error("Not enough data to calculate RVGI")
  }

  const rvgiData = data.map((item, index) => {
    if (index < period - 1) return NaN
    const close = item.close
    const open = item.open
    const high = item.high
    const low = item.low

    return ((close - open) / (high - low)) * 100
  })

  const smaValues = calculateSMA(
    rvgiData.map(v => ({ close: v }) as OHLCV),
    { period },
  )

  return smaValues
}
