import { OHLCV, IndicatorParamsMap, IndicatorType } from "../indicators.interface"
import { indicatorsCalculatorsMap } from "./indicators-calculators-map"

export type CalculateIndicatorParams<T extends IndicatorType> = {
  indicator: T
  data: OHLCV[]
  params?: IndicatorParamsMap[T]
}

export type CalculateIndicatorFunction<T extends IndicatorType> = {
  // eslint-disable-next-line no-unused-vars
  (data: OHLCV[], params?: IndicatorParamsMap[T]): ReturnType<(typeof indicatorsCalculatorsMap)[T]>
}
