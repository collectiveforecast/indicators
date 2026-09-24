import { OHLCV } from "../../indicators.interface"

export const fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 1, 1.618, 2.618, 3.618] as const

export type FibonacciLevelType = (typeof fibonacciLevels)[number]

export type FibonacciLevelObject = {
  // eslint-disable-next-line no-unused-vars -- mapped type parameter, not a variable
  [K in FibonacciLevelType]: number
}

export type FibonacciExtendResult = {
  direction: "up" | "down"
  start: OHLCV
  end: OHLCV
  retraceEnd: OHLCV
  levels: FibonacciLevelObject
}

export interface Pivot {
  time: number
  price: number
  isHigh: boolean
}

export interface ChartPoint {
  time: number
  index: number
  price: number
}

export interface InternalPivot {
  isHigh: boolean
  vol: number
  start: ChartPoint
  end: ChartPoint
}

export interface ZigZagState {
  pivots: InternalPivot[]
  sumVol: number
}
export interface ZigZagConfig {
  devThreshold?: number
  depth?: number
  allowZigZagOnOneBar?: boolean
}

export interface FibExtensionConfig {
  deviation?: number
  depth?: number
  backstep?: number
}

export type FibLevel = {
  level: number
  price: number
  percentage: number
}

export type FibonacciLevels = {
  startTime: number
  startPrice: number
  endTime: number
  endPrice: number
  height: number
  isUptrend: boolean
  levels: FibLevel[]
}

export const FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618, 2.618]
