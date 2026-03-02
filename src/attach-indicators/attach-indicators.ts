import { calculateIndicator, indicatorsCalculatorsMap } from "../calculate-indicator"
import { formatIndicatorNumbers } from "../format-indicator-numbers"
import { IndicatorType } from "../indicators.interface"
import {
  AttachIndicatorsParams,
  CurrentIndicatorsMap,
  IndicatorsSeriesMap,
  OHLCVWithIndicators,
} from "./attach-indicators.interface"
import { padIndicatorValues, pickIndexedIndicator } from "./helpers"

export function attachIndicators(
  { data, indicators, formatNumbers }: AttachIndicatorsParams,
  throwOnError = true,
): OHLCVWithIndicators[] {
  const indicatorsSeries: IndicatorsSeriesMap = {}

  for (const key in indicators) {
    const indicator = key as IndicatorType
    const params = indicators[key] ?? undefined

    if (!indicatorsCalculatorsMap[indicator]) continue

    const value = calculateIndicator(
      {
        indicator,
        data,
        params,
      },
      throwOnError,
    )
    if (!value) continue
    indicatorsSeries[indicator] = value
  }

  const result = data.map((item, index) => {
    const currentIndicators: CurrentIndicatorsMap = {}

    for (const key in indicatorsSeries) {
      let values = indicatorsSeries[key]

      values = padIndicatorValues(values, data.length)
      currentIndicators[key] = pickIndexedIndicator(values, index)
    }

    return {
      ...item,
      indicators: currentIndicators,
    }
  })

  return formatNumbers ? formatIndicatorNumbers(result) : result
}
