import { OHLCV } from "../indicators.interface"
import { attachIndicators, pickIndexedIndicator } from "../attach-indicators"
import { indicatorsCalculatorsMap as mockIndicatorsCalculatorsMap } from "../calculate-indicator"

jest.mock("../calculate-indicator/indicators-calculators-map", () => ({
  indicatorsCalculatorsMap: {
    CTI: jest.fn(),
  },
}))

describe("attachIndicators", () => {
  const mockData: OHLCV[] = [
    { open: 1, high: 3, low: 1, close: 1, time: 1, volume: 100 },
    { open: 2, high: 4, low: 2, close: 2, time: 2, volume: 110 },
    { open: 3, high: 5, low: 3, close: 3, time: 3, volume: 120 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return data unchanged if no indicators passed", () => {
    const result = attachIndicators({ data: mockData, indicators: {} })
    expect(result).toHaveLength(3)
    result.forEach((item, i) => {
      expect(item.close).toBe(mockData[i].close)
      expect(item.indicators).toEqual({})
    })
  })

  it("should attach single indicator values", () => {
    ;(mockIndicatorsCalculatorsMap.CTI as jest.Mock).mockReturnValue([0.1, 0.2, 0.3])

    const result = attachIndicators({
      data: mockData,
      indicators: { CTI: { period: 3 } },
    })

    expect(mockIndicatorsCalculatorsMap.CTI).toHaveBeenCalledWith(mockData, {
      period: 3,
    })

    expect(result[0].indicators.CTI).toBe(0.1)
    expect(result[1].indicators.CTI).toBe(0.2)
    expect(result[2].indicators.CTI).toBe(0.3)
  })
})

describe("pickIndexedIndicator", () => {
  it("should pick value from array", () => {
    const arr = [10, 20, 30]
    expect(pickIndexedIndicator(arr, 1)).toBe(20)
  })

  it("should pick nested arrays", () => {
    const arr = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    expect(pickIndexedIndicator(arr, 2)).toEqual([3, 6])
  })

  it("should pick object values", () => {
    const obj = { a: [1, 2, 3], b: [10, 20, 30] }
    expect(pickIndexedIndicator(obj, 1)).toEqual({ a: 2, b: 20 })
  })

  it("should return primitive values", () => {
    expect(pickIndexedIndicator(42, 0)).toBe(42)
  })
})
