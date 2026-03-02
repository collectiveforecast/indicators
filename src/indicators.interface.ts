export type OHLCV = {
  close: number
  high: number
  low: number
  open: number
  time: number
  volume: number
}

// Indicators Types
export const IndicatorTypeMap = {
  SMA: "SMA",
  EMA: "EMA",
  RSI: "RSI",
  MACD: "MACD",
  Stochastic: "Stochastic",
  Coppock: "Coppock",
  Random: "Random",
  Impulse: "Impulse",
  RVGI: "RVGI",
  ZLMA: "ZLMA",
  MFI: "MFI",
  MFIPremium: "MFIPremium",
  CCI: "CCI",
  KDJ: "KDJ",
  CTI: "CTI",
  ATR: "ATR",
  RV: "RV",
  Regime: "Regime",
  VWAP: "VWAP",
  CVD: "CVD",
} as const

export type IndicatorType = (typeof IndicatorTypeMap)[keyof typeof IndicatorTypeMap]

export type IndicatorParamsMap = {
  [IndicatorTypeMap.SMA]: SMAParams
  [IndicatorTypeMap.EMA]: EMAParams
  [IndicatorTypeMap.RSI]: RSIParams
  [IndicatorTypeMap.MACD]: MACDParams
  [IndicatorTypeMap.Stochastic]: StochasticParams
  [IndicatorTypeMap.Coppock]: CoppockParams
  [IndicatorTypeMap.Random]: RandomParams
  [IndicatorTypeMap.Impulse]: ImpulseParams
  [IndicatorTypeMap.RVGI]: RVGIParams
  [IndicatorTypeMap.ZLMA]: ZLMAParams
  [IndicatorTypeMap.MFI]: MFIParams
  [IndicatorTypeMap.MFIPremium]: MFIPremiumParams
  [IndicatorTypeMap.CCI]: CCIParams
  [IndicatorTypeMap.KDJ]: KDJParams
  [IndicatorTypeMap.CTI]: CTIParams
  [IndicatorTypeMap.ATR]: ATRParams
  [IndicatorTypeMap.RV]: null
  [IndicatorTypeMap.Regime]: RegimeParams
  [IndicatorTypeMap.VWAP]: null
  [IndicatorTypeMap.CVD]: CVDParams
}

// Indicators Params
type DefaultParams = {
  period?: number
  field?: keyof OHLCV
}

export type EMAParams = DefaultParams
export type SMAParams = DefaultParams
export type RSIParams = DefaultParams
export type CTIParams = DefaultParams
export type RVGIParams = Pick<DefaultParams, "period">
export type ZLMAParams = Pick<DefaultParams, "period">
export type MFIParams = Pick<DefaultParams, "period">
export type MFIPremiumParams = Pick<DefaultParams, "period">
export type CCIParams = Pick<DefaultParams, "period">
export type KDJParams = Pick<DefaultParams, "period">
export type ATRParams = Pick<DefaultParams, "period">

export type MACDParams = {
  fastPeriod: number
  slowPeriod: number
  signalPeriod: number
  field?: keyof OHLCV
}

export type StochasticParams = {
  period?: number
  smoothK?: number
  smoothD?: number
}

export type CoppockParams = {
  periodROC1?: number
  periodROC2?: number
  periodWMA?: number
}

export type RandomParams = {
  length: number
  kdjLength: number
  kdjWeight: number
  buyThreshold: number
  sellThreshold: number
  smaLengths: {
    short: number
    medium: number
    long: number
  }
  leadingSmaLengths: {
    price: number
    range: number
  }
  leadingEmaLength: number
}

export type ImpulseParams = {
  stochLength: number
  smoothK: number
  smoothD: number
  lengths: number[]
  lowerSignal: number
  upperSignal: number
}

export interface RegimeParams {
  atrThreshold?: number
  rvThreshold?: number
  maFastPeriod?: number
  maSlowPeriod?: number
}

export interface CVDParams {
  weighting?: "linear" | "proportional" | "binary"
  normalize?: boolean
}
