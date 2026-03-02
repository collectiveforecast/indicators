import { OHLCV, KDJParams } from "../indicators.interface"

export function calculateKDJ(data: OHLCV[], params?: KDJParams) {
  const { period = 9 } = params || {}

  if (!data || data.length < period) {
    throw new Error("Not enough data to calculate KDJ")
  }

  const K: number[] = []
  const D: number[] = []
  const J: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    const close = data[i].close
    const lowestLow = Math.min(...data.slice(i - period + 1, i + 1).map(d => d.low))
    const highestHigh = Math.max(...data.slice(i - period + 1, i + 1).map(d => d.high))

    const RSV = ((close - lowestLow) / (highestHigh - lowestLow)) * 100

    const prevK = K.length > 0 ? K[K.length - 1] : 50
    const prevD = D.length > 0 ? D[D.length - 1] : 50

    const currentK = (2 / 3) * prevK + (1 / 3) * RSV
    const currentD = (2 / 3) * prevD + (1 / 3) * currentK
    const currentJ = 3 * currentK - 2 * currentD

    K.push(currentK)
    D.push(currentD)
    J.push(currentJ)
  }

  return { K, D, J }
}
