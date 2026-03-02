import { DEFAULT_PERIOD } from "../indicators.constants"
import { ATRParams, OHLCV } from "../indicators.interface"

export function calculateATR(data: OHLCV[], params?: ATRParams) {
  const { period = DEFAULT_PERIOD } = params || {}
  const trueRanges: number[] = []

  // Calculate true ranges
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high
    const low = data[i].low
    const prevClose = data[i - 1].close
    const tr1 = high - low
    const tr2 = Math.abs(high - prevClose)
    const tr3 = Math.abs(low - prevClose)

    trueRanges.push(Math.max(tr1, tr2, tr3))
  }

  // Calculate first ATR as SMA of true ranges
  let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period

  const result = [atr]

  // Calculate remaining ATRs
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period

    result.push(atr)
  }

  return result
}
