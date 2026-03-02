import { OHLCV } from "../indicators.interface"

export function calculateRV(data: OHLCV[]) {
  if (data.length < 2) return null

  let sumSqLogReturns = 0

  for (let i = 1; i < data.length; i++) {
    const r = Math.log(data[i].close / data[i - 1].close)
    sumSqLogReturns += r * r
  }

  const rvDaily = Math.sqrt(sumSqLogReturns)
  const rvAnnual = rvDaily * Math.sqrt(365)

  return { rvDaily, rvAnnual }
}
