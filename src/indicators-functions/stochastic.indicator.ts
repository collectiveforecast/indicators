import { OHLCV, StochasticParams } from "../indicators.interface"
import { DEFAULT_PERIOD } from "../indicators.constants"
import { calculateSMA } from "./sma.indicator"

export function calculateStochastic(data: OHLCV[], params?: StochasticParams) {
  const { period = DEFAULT_PERIOD, smoothK = 3, smoothD = 3 } = params || {}
  const rawK: number[] = []

  // Calculate raw %K
  for (let i = period - 1; i < data.length; i++) {
    let highestHigh = -Infinity
    let lowestLow = Infinity

    for (let j = 0; j < period; j++) {
      highestHigh = Math.max(highestHigh, data[i - j].high)
      lowestLow = Math.min(lowestLow, data[i - j].low)
    }

    const currentClose = data[i].close
    rawK.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100)
  }

  // Smooth %K
  const k = calculateSMA(
    rawK.map(value => ({
      time: 0,
      open: 0,
      high: 0,
      low: 0,
      close: value,
      volume: 0,
    })),
    { period: smoothK, field: "close" },
  )

  // Calculate %D (SMA of %K)
  const d = calculateSMA(
    k.map(value => ({
      time: 0,
      open: 0,
      high: 0,
      low: 0,
      close: value,
      volume: 0,
    })),
    { period: smoothD, field: "close" },
  )

  return { k, d }
}
