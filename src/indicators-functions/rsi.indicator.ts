import { DEFAULT_FIELD, DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, RSIParams } from "../indicators.interface"

export function calculateRSI(data: OHLCV[], params?: RSIParams) {
  const { period = DEFAULT_PERIOD, field = DEFAULT_FIELD } = params || {}
  const rsiData: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = (data[i][field] as number) - (data[i - 1][field] as number)
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  // Calculate first average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

  // Calculate RSI
  for (let i = period; i < data.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i - 1]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period

    const rs = avgGain / (avgLoss || 0.001)
    const rsi = 100 - 100 / (1 + rs)

    rsiData.push(rsi)
  }

  return rsiData
}
