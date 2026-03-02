import { CVDParams, OHLCV } from "../indicators.interface"

export function calculateCVD(data: OHLCV[], params?: CVDParams) {
  const { weighting = "proportional", normalize = false } = params || {}

  const result: number[] = []
  let cumulative = 0

  for (const bar of data) {
    const { open, close, high, low, volume } = bar

    let delta = 0

    switch (weighting) {
      case "binary":
        if (close > open) delta = volume
        else if (close < open) delta = -volume
        else delta = 0
        break

      case "linear": {
        const change = close - open
        const range = Math.max(high - low, 1e-9)
        delta = (change / range) * volume
        break
      }

      case "proportional":
      default:
        delta = ((close - open) / open) * volume
        delta = ((close - open) / Math.max(open, 1e-9)) * volume
        break
    }

    cumulative += delta
    result.push(cumulative)
  }

  if (normalize && result.length > 0) {
    const start = result[0]
    for (let i = 0; i < result.length; i++) result[i] -= start
  }

  return result
}
