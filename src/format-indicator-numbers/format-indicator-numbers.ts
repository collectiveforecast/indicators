import { CurrentIndicatorsMap, OHLCVWithIndicators } from "../attach-indicators"
import { IndicatorType, IndicatorTypeMap } from "../indicators.interface"

import {
  dynamicFormatPriceValue,
  formatNumber,
  formatNumberArray,
} from "./format-indicator-numbers.helper"

export function formatIndicatorNumbers(data: OHLCVWithIndicators[]): OHLCVWithIndicators[] {
  return data.map(item => {
    const formatted: OHLCVWithIndicators = {
      ...item,
      indicators: {},
    }

    for (const key in item.indicators) {
      const value = item.indicators[key as IndicatorType]

      switch (key) {
        case IndicatorTypeMap.RSI:
        case IndicatorTypeMap.MFI:
        case IndicatorTypeMap.CCI:
        case IndicatorTypeMap.ATR:
        case IndicatorTypeMap.VWAP:
          formatted.indicators[key] = formatNumber(value as number, 0)
          break

        case IndicatorTypeMap.SMA:
        case IndicatorTypeMap.EMA:
        case IndicatorTypeMap.ZLMA:
        case IndicatorTypeMap.CVD:
          formatted.indicators[key] = dynamicFormatPriceValue(value as number)
          break

        case IndicatorTypeMap.RVGI:
        case IndicatorTypeMap.CTI:
        case IndicatorTypeMap.MFIPremium:
          formatted.indicators[key] = formatNumber(value as number, 2)
          break

        case IndicatorTypeMap.Coppock:
          formatted.indicators[key] = formatNumber(value as number, 1)
          break

        case IndicatorTypeMap.Stochastic:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.Stochastic]
            >

            formatted.indicators[key] = {
              k: formatNumber(typedValue.k, 0),
              d: formatNumber(typedValue.d, 0),
            }
          }
          break

        case IndicatorTypeMap.MACD:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.MACD]
            >

            formatted.indicators[key] = {
              macdLine: dynamicFormatPriceValue(typedValue.macdLine),
              signalLine: dynamicFormatPriceValue(typedValue.signalLine),
              histogram: dynamicFormatPriceValue(typedValue.histogram),
            }
          }
          break

        case IndicatorTypeMap.KDJ:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.KDJ]
            >

            formatted.indicators[key] = {
              K: formatNumber(typedValue.K, 0),
              D: formatNumber(typedValue.D, 0),
              J: formatNumber(typedValue.J, 0),
            }
          }
          break

        case IndicatorTypeMap.Random:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.Random]
            >

            formatted.indicators[key] = {
              ...typedValue,
              k: formatNumber(typedValue.k, 2),
              d: formatNumber(typedValue.d, 2),
              leadingLine: formatNumber(typedValue.leadingLine, 2),
            }
          }
          break

        case IndicatorTypeMap.Impulse:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.Impulse]
            >

            formatted.indicators[key] = {
              ...typedValue,
              k: formatNumber(typedValue.k, 1),
              multiFrameK: formatNumberArray(typedValue.multiFrameK, 1),
            }
          }
          break

        case IndicatorTypeMap.RV:
          {
            const typedValue = value as NonNullable<
              CurrentIndicatorsMap[typeof IndicatorTypeMap.RV]
            >

            formatted.indicators[key] = {
              rvDaily: formatNumber(typedValue.rvDaily, 2),
              rvAnnual: formatNumber(typedValue.rvAnnual, 2),
            }
          }
          break

        default:
          formatted.indicators[key] = value
      }
    }

    return formatted
  })
}
