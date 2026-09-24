type ZoneKind = "support" | "resistance"

type ZoneStrength = "strong" | "moderate" | "weak"

/**
 * A price band that the market has turned at more than once.
 *
 * A band rather than a line: swing highs never repeat to the tick, so the thing
 * that actually held is the region they cluster in. Width comes from ATR, which
 * is what keeps one definition usable on a 3m chart and on a 1M chart.
 */
type SupportResistanceZone = {
  kind: ZoneKind
  /** Band edges. `price` is the midpoint — the single number to quote. */
  lower: number
  upper: number
  price: number
  /** Swing pivots inside the band. */
  touches: number
  /** Touches that were swing highs, and touches that were swing lows. */
  touchesFromAbove: number
  touchesFromBelow: number
  firstTouchTime: number
  lastTouchTime: number
  /**
   * Touch count discounted by how long ago the last touch was, normalised
   * against the strongest zone in the same run. Ranking and render weight
   * only — compare `strength` for an absolute judgement.
   */
  score: number
  strength: ZoneStrength
  /**
   * Held as both support and resistance, so price has traded through it and
   * come back. The classic role-reversal level.
   */
  flipped: boolean
}

type ZonesConfig = {
  /** Zigzag pivot detection, passed straight through. */
  depth?: number
  deviation?: number
  backstep?: number
  atrPeriod?: number
  /** Furthest a pivot may sit from a cluster's mean to join it, in ATR. */
  clusterAtrMultiplier?: number
  /** Pivots in a cluster before it counts as a zone. Below 2 is just a pivot. */
  minTouches?: number
  /** Candles after which a touch counts half as much. */
  recencyHalfLifeCandles?: number
  maxZones?: number
}

export { SupportResistanceZone, ZoneKind, ZoneStrength, ZonesConfig }
