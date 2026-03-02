import { indicatorsCalculatorsMap } from "../calculate-indicator"
import { IndicatorParamsMap, IndicatorType, OHLCV } from "../indicators.interface"

export type AttachIndicatorsParams = {
  data: OHLCV[]
  indicators: { [K in IndicatorType]?: IndicatorParamsMap[K] | null }
  formatNumbers?: boolean
}

export type OHLCVWithIndicators = OHLCV & {
  indicators: { [K in IndicatorType]?: CurrentIndicatorsMap[K] }
}

export type IndicatorsSeriesMap = Partial<
  Record<string, ReturnType<(typeof indicatorsCalculatorsMap)[IndicatorType]>>
>

export type CurrentIndicatorsMap = Partial<{
  [K in IndicatorType]: IndexedIndicator<ReturnType<(typeof indicatorsCalculatorsMap)[K]>>
}>

export type IndexedIndicator<T> = T extends (infer U)[]
  ? U extends (infer V)[]
    ? IndexedIndicator<V | null>[]
    : U | null
  : T extends object
    ? { [K in keyof T]: IndexedIndicator<T[K]> }
    : T | null
