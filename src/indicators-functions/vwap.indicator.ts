import { OHLCV } from "../indicators.interface"

export function calculateVWAP(data: OHLCV[]) {
  const result: number[] = []

  let cumulativePV = 0
  let cumulativeVolume = 0

  for (let i = 0; i < data.length; i++) {
    const { high, low, close, volume } = data[i]
    const typicalPrice = (high + low + close) / 3

    cumulativePV += typicalPrice * volume
    cumulativeVolume += volume

    const vwap = cumulativePV / cumulativeVolume

    result.push(vwap)
  }

  return result
}
