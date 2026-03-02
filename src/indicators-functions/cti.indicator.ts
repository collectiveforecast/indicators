import { DEFAULT_FIELD } from "./../indicators.constants"
import { DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, CTIParams } from "../indicators.interface"

export function calculateCTI(data: OHLCV[], params?: CTIParams) {
  const { period = DEFAULT_PERIOD, field = DEFAULT_FIELD } = params || {}
  const ctiData: (number | null)[] = Array(data.length).fill(null)

  for (let i = period - 1; i < data.length; i++) {
    let Sx = 0,
      Sy = 0,
      Sxx = 0,
      Sxy = 0,
      Syy = 0

    for (let count = 0; count < period; count++) {
      const X = data[i - count][field]
      const Y = -count
      Sx += X
      Sy += Y
      Sxx += X * X
      Sxy += X * Y
      Syy += Y * Y
    }

    const denom = Math.sqrt((period * Sxx - Sx * Sx) * (period * Syy - Sy * Sy))

    if (denom > 0) {
      ctiData[i] = (period * Sxy - Sx * Sy) / denom
    } else {
      ctiData[i] = 0
    }
  }

  return ctiData
}
