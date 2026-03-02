import { IndicatorType, IndicatorTypeMap } from "../indicators.interface"

export function getIndicatorTypes(): IndicatorType[] {
  return Object.values(IndicatorTypeMap)
}

export function createIndicatorObject(indicators: IndicatorType[]): Record<IndicatorType, null> {
  return indicators.reduce(
    (acc, ind) => {
      acc[ind] = null
      return acc
    },
    {} as Record<IndicatorType, null>,
  )
}

export function validateIndicators(indicators: string[]): IndicatorType[] {
  const validIndicators = new Map(
    Object.values(IndicatorTypeMap).map(ind => [ind.toLowerCase(), ind]),
  )

  return indicators
    .map(ind => validIndicators.get(ind.toLowerCase()))
    .filter((ind): ind is IndicatorType => ind !== undefined)
}

export function getIndicatorsConfigExplanation(): Record<IndicatorType, string | null> {
  return {
    [IndicatorTypeMap.SMA]: 'period: 14, field: "close"',
    [IndicatorTypeMap.EMA]: 'period: 14, field: "close"',
    [IndicatorTypeMap.RSI]: 'period: 14, field: "close"',
    [IndicatorTypeMap.MACD]: 'fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, field: "close"',
    [IndicatorTypeMap.Stochastic]: "period: 14, smoothK: 3, smoothD: 3",
    [IndicatorTypeMap.Coppock]: "periodROC1: 14, periodROC2: 11, periodWMA: 10",
    [IndicatorTypeMap.Random]:
      "length: 30, kdjLength: 3, kdjWeight: 1, buyThreshold: 25, sellThreshold: 75, smaLengths: {short: 13, medium: 26, long: 90}, leadingSmaLengths: {price: 21, range: 34}, leadingEmaLength: 4",
    [IndicatorTypeMap.Impulse]:
      "stochLength: 22, smoothK: 6, smoothD: 3, lengths: [15, 45, 60, 120, 180, 240], lowerSignal: 17, upperSignal: 83",
    [IndicatorTypeMap.RVGI]: "period: 14",
    [IndicatorTypeMap.ZLMA]: "period: 14",
    [IndicatorTypeMap.MFI]: "period: 14",
    [IndicatorTypeMap.MFIPremium]: "period: 14",
    [IndicatorTypeMap.CCI]: "period: 14",
    [IndicatorTypeMap.KDJ]: "period: 14",
    [IndicatorTypeMap.CTI]: 'period: 14, field: "close"',
    [IndicatorTypeMap.ATR]: "period: 14",
    [IndicatorTypeMap.RV]: null,
    [IndicatorTypeMap.Regime]:
      "atrThreshold: 0.005, rvThreshold: 0.01, maFastPeriod: 10, maSlowPeriod: 30",
    [IndicatorTypeMap.VWAP]: null,
    [IndicatorTypeMap.CVD]: 'weighting: "proportional", normalize: false',
  }
}
