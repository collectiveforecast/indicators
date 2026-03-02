import { OHLCV, ImpulseParams } from "../indicators.interface"
import { calculateSMA } from "./sma.indicator"

export function calculateImpulse(
  data: OHLCV[],
  params: ImpulseParams = {
    stochLength: 22,
    smoothK: 6,
    smoothD: 3,
    lengths: [15, 45, 60, 120, 180, 240],
    lowerSignal: 17,
    upperSignal: 83,
  },
) {
  const len = data.length

  const impulseData = {
    k: new Array<number>(len).fill(0),
    multiFrameK: Array(params.lengths.length)
      .fill([])
      .map(() => new Array<number>(len).fill(0)),
    buySignals: new Array<boolean>(len).fill(false),
    sellSignals: new Array<boolean>(len).fill(false),
    impulseZones: {
      bull: Array(params.lengths.length - 1)
        .fill([])
        .map(() => new Array<boolean>(len).fill(false)),
      bear: Array(params.lengths.length - 1)
        .fill([])
        .map(() => new Array<boolean>(len).fill(false)),
    },
  }

  // Calculate base stochastic
  for (let i = params.stochLength - 1; i < len; i++) {
    const slice = data.slice(i - params.stochLength + 1, i + 1)

    const highest = Math.max(...slice.map(d => d.high))
    const lowest = Math.min(...slice.map(d => d.low))

    impulseData.k[i] = ((data[i].close - lowest) / (highest - lowest || 1)) * 100
  }

  //Apply smoothing to the main K line
  impulseData.k = calculateSMA(
    impulseData.k.map(v => ({ close: v }) as OHLCV),
    { period: params.smoothK },
  )

  //Calculate stochastic for different periods
  for (let p = 0; p < params.lengths.length; p++) {
    const periodLength = params.lengths[p]

    for (let i = periodLength - 1; i < len; i++) {
      const values = impulseData.k.slice(Math.max(0, i - periodLength + 1), i + 1)
      impulseData.multiFrameK[p][i] = values.reduce((sum, val) => sum + val, 0) / values.length
    }
  }

  // Signals
  for (let i = 1; i < len; i++) {
    let allPeriodsOverbought = true
    let allPeriodsOversold = true

    for (let p = 0; p < params.lengths.length; p++) {
      const k = impulseData.multiFrameK[p][i]

      if (k <= params.upperSignal) allPeriodsOverbought = false
      if (k >= params.lowerSignal) allPeriodsOversold = false

      if (p < params.lengths.length - 1) {
        const nextK = impulseData.multiFrameK[p + 1][i]
        impulseData.impulseZones.bull[p][i] = k < nextK
        impulseData.impulseZones.bear[p][i] = k > nextK
      }
    }

    impulseData.buySignals[i] = allPeriodsOversold
    impulseData.sellSignals[i] = allPeriodsOverbought
  }

  return impulseData
}
