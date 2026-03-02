import { IndicatorType } from "../indicators.interface"
import { indicatorsCalculatorsMap } from "./indicators-calculators-map"
import {
  CalculateIndicatorFunction,
  CalculateIndicatorParams,
} from "./calculate-indicator.interface"

export function calculateIndicator<T extends IndicatorType>(
  { indicator, data, params }: CalculateIndicatorParams<T>,
  throwOnError = true,
) {
  const fn = indicatorsCalculatorsMap[indicator] as CalculateIndicatorFunction<T>

  try {
    return fn(data, params)
  } catch (e) {
    if (throwOnError) throw e
    return null
  }
}
