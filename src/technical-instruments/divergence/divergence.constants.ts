import { TIMEFRAME_MS, Timeframe } from "../../timeframes"
import { DivergenceConfig } from "./divergence.interface"

export const tfToDivergenceConfigs: Partial<Record<Timeframe, DivergenceConfig>> = {
  "4h": {
    pivotLookbackLeft: 12,
    pivotLookbackRight: 3,
    maxLookbackRange: 45,
    minLookbackRange: 4,
    strengthThreshold: 5,
  },
  "1d": {
    pivotLookbackLeft: 14,
    pivotLookbackRight: 3,
    maxLookbackRange: 60,
    minLookbackRange: 3,
    strengthThreshold: 4,
  },
  "1w": {
    pivotLookbackLeft: 7,
    pivotLookbackRight: 4,
    maxLookbackRange: 60,
    minLookbackRange: 6,
    strengthThreshold: 4,
  },
  "15m": {
    pivotLookbackLeft: 3,
    pivotLookbackRight: 2,
    maxLookbackRange: 20,
    minLookbackRange: 2,
    strengthThreshold: 4,
  },
  "1h": {
    pivotLookbackLeft: 7,
    pivotLookbackRight: 3,
    maxLookbackRange: 35,
    minLookbackRange: 5,
    strengthThreshold: 4,
  },
}

/** Sorted so the fallback below never depends on the key order above. */
const tunedDivergenceTimeframes = (Object.keys(tfToDivergenceConfigs) as Timeframe[]).sort(
  (a, b) => TIMEFRAME_MS[a] - TIMEFRAME_MS[b],
)

/**
 * A tuned config for any timeframe, falling back to the nearest one that was
 * actually tuned.
 *
 * `tfToDivergenceConfigs` covers five timeframes, but a chart can be on any of
 * fifteen. Pivot lookbacks are counted in bars, so the closest tuned timeframe
 * by duration behaves closest — and the distance is measured on a log scale,
 * because 5m is to 15m what 1d is to 3d. A linear distance would collapse
 * every intraday timeframe onto 15m.
 *
 * Exact ties (30m, equidistant from 15m and 1h) go to the longer timeframe:
 * its lookbacks are wider relative to the chart, so it finds fewer and better
 * divergences, which is the right way to be wrong on a timeframe nobody tuned.
 */
function divergenceConfigForTimeframe(timeframe: Timeframe): DivergenceConfig {
  const tuned = tfToDivergenceConfigs[timeframe]
  if (tuned) return tuned

  const target = TIMEFRAME_MS[timeframe]
  const distance = (candidate: Timeframe) => Math.abs(Math.log(TIMEFRAME_MS[candidate] / target))

  const nearest = tunedDivergenceTimeframes.reduce((best, candidate) =>
    distance(candidate) <= distance(best) ? candidate : best,
  )

  // `nearest` came out of this object's own keys, so the lookup is defined.
  return tfToDivergenceConfigs[nearest] as DivergenceConfig
}

export { divergenceConfigForTimeframe }
