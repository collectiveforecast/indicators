import { calculateIndicator } from "../../calculate-indicator"
import { IndicatorTypeMap, OHLCV } from "../../indicators.interface"
import { Pivot } from "../zigzag/zigzag.interface"
import { zigzag } from "../zigzag/zigzag.instrument"
import { DEFAULT_ZONES_CONFIG, ZONE_STRENGTH_THRESHOLDS } from "./zones.constants"
import { SupportResistanceZone, ZoneStrength, ZonesConfig } from "./zones.interface"

/**
 * Finds support and resistance zones by clustering zigzag swing pivots.
 *
 * The premise is that a level matters because the market turned there, so the
 * evidence is the pivots themselves — the same ones `calculateFibRetracement`
 * reads. Pivots whose prices fall within an ATR-scaled band of each other are
 * one zone; a zone with more touches, and more recent ones, scores higher.
 *
 * Every threshold is relative (ATR for width, candles for age), so no
 * per-timeframe or per-asset tuning is needed.
 *
 * @returns zones sorted strongest first, at most `maxZones`. Empty when there
 * is not enough data, when zigzag finds fewer than two pivots, or when ATR is
 * unusable (a flat series).
 */
export function calculateZones(
  candles: OHLCV[],
  config: ZonesConfig = {},
): SupportResistanceZone[] {
  const settings = { ...DEFAULT_ZONES_CONFIG, ...config }

  if (candles.length < settings.depth * 2 || candles.length <= settings.atrPeriod + 1) return []

  const pivots = zigzag(candles, {
    depth: settings.depth,
    deviation: settings.deviation,
    backstep: settings.backstep,
  })
  if (pivots.length < 2) return []

  const atr = latestAtr(candles, settings.atrPeriod)
  if (!atr || atr <= 0) return []

  const band = atr * settings.clusterAtrMultiplier
  const lastClose = candles[candles.length - 1].close
  const candleMs = medianCandleMs(candles)
  const lastTime = candles[candles.length - 1].time

  const zones = clusterPivots(pivots, band)
    .filter(cluster => cluster.length >= settings.minTouches)
    .map(cluster => toZone(cluster, { band, lastClose, lastTime, candleMs, settings }))

  if (zones.length === 0) return []

  // `score` is reported normalised so the client can use it directly as a
  // render weight; `strength` stays absolute, or a chart with nothing but
  // weak zones would still report its best one as strong.
  const best = Math.max(...zones.map(zone => zone.score))
  for (const zone of zones) zone.score = best > 0 ? round(zone.score / best, 3) : 0

  return zones.sort((a, b) => b.score - a.score).slice(0, settings.maxZones)
}

/**
 * Single pass over price-sorted pivots, comparing each against the running mean
 * of the open cluster rather than its first member: without that, a long drift
 * of pivots each within `band` of the previous one grows into one zone many
 * times wider than the band.
 */
function clusterPivots(pivots: Pivot[], band: number): Pivot[][] {
  const sorted = [...pivots].sort((a, b) => a.price - b.price)
  const clusters: Pivot[][] = []

  let current: Pivot[] = []
  let sum = 0

  for (const pivot of sorted) {
    if (current.length === 0 || Math.abs(pivot.price - sum / current.length) <= band) {
      current.push(pivot)
      sum += pivot.price
    } else {
      clusters.push(current)
      current = [pivot]
      sum = pivot.price
    }
  }
  if (current.length > 0) clusters.push(current)

  return clusters
}

function toZone(
  cluster: Pivot[],
  context: {
    band: number
    lastClose: number
    lastTime: number
    candleMs: number
    settings: Required<ZonesConfig>
  },
): SupportResistanceZone {
  const { band, lastClose, lastTime, candleMs, settings } = context

  const prices = cluster.map(pivot => pivot.price)
  let lower = Math.min(...prices)
  let upper = Math.max(...prices)

  // Pivots landing on the same price would otherwise give a zero-width zone,
  // which is a line the client cannot shade and the user cannot trade against.
  if (upper - lower < band) {
    const mid = (upper + lower) / 2
    lower = mid - band / 2
    upper = mid + band / 2
  }

  const times = cluster.map(pivot => pivot.time)
  const lastTouchTime = Math.max(...times)
  const touchesFromAbove = cluster.filter(pivot => pivot.isHigh).length

  const ageCandles = candleMs > 0 ? (lastTime - lastTouchTime) / candleMs : 0
  const recency = Math.pow(0.5, Math.max(0, ageCandles) / settings.recencyHalfLifeCandles)
  const effectiveTouches = cluster.length * recency

  const price = (upper + lower) / 2

  return {
    kind: price >= lastClose ? "resistance" : "support",
    lower,
    upper,
    price,
    touches: cluster.length,
    touchesFromAbove,
    touchesFromBelow: cluster.length - touchesFromAbove,
    firstTouchTime: Math.min(...times),
    lastTouchTime,
    score: effectiveTouches,
    strength: toStrength(effectiveTouches),
    flipped: touchesFromAbove > 0 && touchesFromAbove < cluster.length,
  }
}

function toStrength(effectiveTouches: number): ZoneStrength {
  if (effectiveTouches >= ZONE_STRENGTH_THRESHOLDS.strong) return "strong"
  if (effectiveTouches >= ZONE_STRENGTH_THRESHOLDS.moderate) return "moderate"
  return "weak"
}

function latestAtr(candles: OHLCV[], period: number): number | null {
  const atr = calculateIndicator(
    { indicator: IndicatorTypeMap.ATR, data: candles, params: { period } },
    false,
  )
  if (!Array.isArray(atr)) return null

  for (let i = atr.length - 1; i >= 0; i--) {
    if (Number.isFinite(atr[i])) return atr[i]
  }
  return null
}

/**
 * Median rather than mean, and read from the candles rather than the timeframe:
 * exchanges skip candles, and one gap of a week would otherwise age every zone
 * on the chart into irrelevance.
 */
function medianCandleMs(candles: OHLCV[]): number {
  if (candles.length < 2) return 0

  const gaps: number[] = []
  for (let i = 1; i < candles.length; i++) gaps.push(candles[i].time - candles[i - 1].time)
  gaps.sort((a, b) => a - b)

  return gaps[Math.floor(gaps.length / 2)]
}

function round(value: number, digits: number): number {
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}
