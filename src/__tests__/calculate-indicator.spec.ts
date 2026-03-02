import { IndicatorTypeMap, OHLCV } from "../indicators.interface"
import { calculateIndicator, indicatorsCalculatorsMap } from "../calculate-indicator"

describe("calculateIndicator", () => {
  const mockData: OHLCV[] = [
    { open: 1, high: 3, low: 1, close: 1, time: 1, volume: 100 },
    { open: 2, high: 4, low: 2, close: 2, time: 2, volume: 110 },
    { open: 3, high: 5, low: 3, close: 3, time: 3, volume: 120 },
    { open: 4, high: 6, low: 4, close: 4, time: 4, volume: 130 },
    { open: 5, high: 7, low: 5, close: 5, time: 5, volume: 140 },
  ]

  it("should handle optional params", () => {
    const result = calculateIndicator({
      indicator: IndicatorTypeMap.SMA,
      data: mockData,
    })

    expect(Array.isArray(result)).toBe(true)
  })

  it("should call the correct indicator function and return its result", () => {
    const result = calculateIndicator({
      indicator: IndicatorTypeMap.SMA,
      data: mockData,
      params: { period: 3 },
    })

    const expected = [(1 + 2 + 3) / 3, (2 + 3 + 4) / 3, (3 + 4 + 5) / 3]

    expect(result).toEqual(expected)
  })

  it("should work for another indicator, e.g., CCI", () => {
    const result = calculateIndicator({
      indicator: IndicatorTypeMap.CCI,
      data: mockData,
      params: { period: 3 },
    })

    expect(Array.isArray(result)).toBe(true)
    expect(result?.length).toBe(mockData.length - 2)
  })

  it("should match the result with direct calculator call", () => {
    const smaDirect = indicatorsCalculatorsMap[IndicatorTypeMap.SMA](mockData, {
      period: 3,
    })

    const smaViaFunction = calculateIndicator({
      indicator: IndicatorTypeMap.SMA,
      data: mockData,
      params: { period: 3 },
    })

    expect(smaViaFunction).toEqual(smaDirect)
  })
})
