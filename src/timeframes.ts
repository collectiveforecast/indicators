export const TIMEFRAMES = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
] as const

export type Timeframe = (typeof TIMEFRAMES)[number]

/**
 * Length of one candle, in milliseconds.
 *
 * `1M` is nominal. Calendar months vary, but callers use this for window sizing
 * and for picking the nearest tuned config, where a 30-day approximation costs
 * nothing.
 */
export const TIMEFRAME_MS: Record<Timeframe, number> = {
  "1m": 60_000,
  "3m": 3 * 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 3_600_000,
  "2h": 2 * 3_600_000,
  "4h": 4 * 3_600_000,
  "6h": 6 * 3_600_000,
  "8h": 8 * 3_600_000,
  "12h": 12 * 3_600_000,
  "1d": 86_400_000,
  "3d": 3 * 86_400_000,
  "1w": 7 * 86_400_000,
  "1M": 30 * 86_400_000,
}
