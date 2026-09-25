export interface Pivot {
  time: number
  price: number
  isHigh: boolean
}

export type SwingPoint = {
  time: number
  direction: "up" | "down"
  value: number
}
export interface ZigZagConfig {
  depth: number // same as PineScript depth
  deviation: number // same as PineScript deviation
  backstep: number // same as PineScript backstep
  mintick?: number // syminfo.mintick. Default=0.01 unless provided
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
