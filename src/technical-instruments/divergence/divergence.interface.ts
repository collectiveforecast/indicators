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

export type SwingPoint = {
  time: number
  direction: "up" | "down"
  value: number
}

export type IndexedSwingPoint = {
  index: number
  direction: "up" | "down"
  value: number
}

export type DivergenceConfig = {
  pivotLookbackLeft: number
  pivotLookbackRight: number
  strengthThreshold: number // difference threshold for strong divergence
  minLookbackRange?: number // Min lookback range for pivot comparison
  maxLookbackRange?: number // Max lookback range for pivot comparison
  smoothingLength?: number // length of smoothing applied to price/indicator data to reduce noise
  minDistance?: number // minimum number of bars between pivots to consider divergence
  validateDivergence?: boolean // whether to validate divergence with subsequent price action
  attachHidden?: boolean
}

export type DivergenceType = "bullish" | "bearish" | "hidden_bullish" | "hidden_bearish"

export type Divergence = {
  type: DivergenceType
  priceSwing1: SwingPoint
  priceSwing2: SwingPoint
  indicatorSwing1: SwingPoint
  indicatorSwing2: SwingPoint
  strength: "strong" | "weak"
}
