import { OHLCV, RegimeParams } from "../indicators.interface"
import { calculateATR } from "./atr.indicator"
import { calculateRV } from "./rv.indicator"

interface CalculateRegimeResult {
  volRegime: "low-vol" | "high-vol"
  trendRegime: "trend" | "mean-revert"
}

export function calculateRegime(data: OHLCV[], params?: RegimeParams): CalculateRegimeResult {
  const {
    atrThreshold = 0.005,
    rvThreshold = 0.01,
    maFastPeriod = 10,
    maSlowPeriod = 30,
  } = params || {}

  if (!data || data.length < maSlowPeriod) {
    return { volRegime: "low-vol", trendRegime: "mean-revert" }
  }

  const price = data[data.length - 1].close

  const atrArray = calculateATR(data, { period: maFastPeriod })
  const atr = atrArray.at(-1) ?? 0
  const rv = calculateRV(data)?.rvDaily ?? 0

  const atrRatio = atr / price
  const volRegime = atrRatio > atrThreshold || rv > rvThreshold ? "high-vol" : "low-vol"

  const closes = data.map(c => c.close)
  const maFast = closes.slice(-maFastPeriod).reduce((a, b) => a + b, 0) / maFastPeriod
  const maSlow = closes.slice(-maSlowPeriod).reduce((a, b) => a + b, 0) / maSlowPeriod

  const trendRegime = maFast - maSlow > 0 ? "trend" : "mean-revert"

  return { volRegime, trendRegime }
}
