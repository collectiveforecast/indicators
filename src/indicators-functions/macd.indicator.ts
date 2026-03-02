import { calculateEMA } from "./ema.indicator"
import { DEFAULT_FIELD } from "../indicators.constants"
import { OHLCV, MACDParams } from "../indicators.interface"

export function calculateMACD(data: OHLCV[], params?: MACDParams) {
  const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, field = DEFAULT_FIELD } = params || {}

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(data, { period: fastPeriod, field })
  const slowEMA = calculateEMA(data, { period: slowPeriod, field })

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = []
  for (let i = 0; i < fastEMA.length; i++) {
    if (i >= slowPeriod - fastPeriod) {
      macdLine.push(fastEMA[i] - slowEMA[i - (slowPeriod - fastPeriod)])
    }
  }

  // Calculate signal line (EMA of MACD line)
  const macdData = macdLine.map(value => ({
    time: 0,
    open: 0,
    high: 0,
    low: 0,
    close: value,
    volume: 0,
  }))
  const signalLine = calculateEMA(macdData, {
    period: signalPeriod,
    field: "close",
  })

  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = []
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i])
  }

  return { macdLine, signalLine, histogram }
}
