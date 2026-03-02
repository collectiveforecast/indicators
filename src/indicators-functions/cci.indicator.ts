import { DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, CCIParams } from "../indicators.interface"

export function calculateCCI(data: OHLCV[], params?: CCIParams) {
  const { period = DEFAULT_PERIOD } = params || {}
  const cciData: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    const typicalPrices = data
      .slice(i - period + 1, i + 1)
      .map(d => (Number(d.high) + Number(d.low) + Number(d.close)) / 3)

    const sma = typicalPrices.reduce((sum, tp) => sum + tp, 0) / period

    const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period

    const currentTP = typicalPrices[typicalPrices.length - 1]
    const cciValue = (currentTP - sma) / (0.015 * meanDeviation)

    cciData.push(cciValue)
  }

  return cciData
}
