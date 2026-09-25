import { ZonesConfig } from "./zones.interface"

/**
 * Deliberately not a per-timeframe table, unlike `tfToDivergenceConfigs`.
 *
 * Divergence lookbacks are counted in bars, so they have to be retuned per
 * timeframe. Zone width is measured in ATR and zone age in candles, both of
 * which scale with the chart on their own — so one set of numbers holds from
 * 3m to 1M, and from a $0.00001 token to BTC.
 */
const DEFAULT_ZONES_CONFIG: Required<ZonesConfig> = {
  depth: 12,
  deviation: 5,
  backstep: 2,
  atrPeriod: 14,
  clusterAtrMultiplier: 0.75,
  minTouches: 2,
  recencyHalfLifeCandles: 120,
  maxZones: 6,
}

/** Effective (recency-discounted) touches needed for each strength label. */
const ZONE_STRENGTH_THRESHOLDS = {
  strong: 3,
  moderate: 1.75,
} as const

export { DEFAULT_ZONES_CONFIG, ZONE_STRENGTH_THRESHOLDS }
