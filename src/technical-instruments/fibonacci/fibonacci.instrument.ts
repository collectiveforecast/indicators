import { OHLCV } from "../../indicators.interface"
import { zigzag } from "../zigzag/zigzag.instrument"
import {
  FibLevel,
  FIBONACCI_LEVELS,
  FibonacciLevels,
  FibExtensionConfig,
} from "./fibonacci.interface"

/**
 * Calculates Fibonacci retracement levels based on the last detected zigzag swing.
 *
 * This function identifies significant price pivots using zigzag detection and calculates
 * Fibonacci levels based on the most recent swing (last two pivots).
 *
 * @param ohlcvData - Array of OHLCV (Open, High, Low, Close, Volume) price data
 * @param config - Configuration object with the following optional parameters:
 *
 * @param config.thresholdMultiplier - Controls sensitivity of pivot detection (default: 3)
 *   - Range: 0.5 - 5 (typically)
 *   - Lower (0.5-1.5): More sensitive, detects smaller swings, more noise
 *   - Medium (2-4): Balanced, filters minor fluctuations
 *   - Higher (5+): Less sensitive, only major swings
 *   - When useATRThreshold=false: used directly as percentage (e.g., 3 = 3% threshold)
 *   - When useATRThreshold=true: multiplies ATR-based percentage
 *
 * @param config.depth - Lookback period for pivot confirmation (default: 10)
 *   - Range: 5 - 20 (typically)
 *   - Actual lookback is depth/2 bars on each side
 *   - Lower (5-10): Faster detection, more responsive, may create false pivots
 *   - Higher (15-30): More confirmed pivots, slower reaction, filters noise
 *
 * @param config.reverse - Flip the direction of Fibonacci calculation (default: false)
 *   - false: Normal direction from earlier pivot to later pivot
 *   - true: Reversed direction from later pivot to earlier pivot
 *
 * @param config.useATRThreshold - Use dynamic (ATR-based) vs static threshold (default: true)
 *   - true: Threshold adapts to volatility, better for varying conditions
 *     WARNING: Can produce excessive thresholds (100%+) for low-priced assets (<$1)
 *   - false: Uses thresholdMultiplier directly as percentage, predictable behavior
 *     RECOMMENDED for assets priced below $1
 *
 * @param config.atrPeriod - Period for ATR calculation (default: 10)
 *   - Range: 10 - 20 (typically)
 *   - Only relevant when useATRThreshold=true
 *   - Lower (5-10): More responsive to recent volatility changes
 *   - Higher (20-50): Smoother, reflects longer-term average volatility
 *
 * @returns FibRetracement object containing:
 *   - startTime, startPrice: Beginning of the swing
 *   - endTime, endPrice: End of the swing
 *   - height: Price difference (startPrice - endPrice)
 *   - isUptrend: Whether the swing is upward (height < 0)
 *   - levels: Array of Fibonacci levels with their prices
 *
 * @returns null if:
 *   - Not enough data (< depth * 2 bars)
 *   - Less than 2 pivots detected
 *
 * @example
 * // For low-priced assets (< $1)
 * const fib = calculateLastFibRetracement(ohlcvData, {
 *   thresholdMultiplier: 3,
 *   useATRThreshold: false,  // Critical for low-priced assets
 *   depth: 10
 * });
 *
 * @example
 * // For normal-priced assets with dynamic threshold
 * const fib = calculateLastFibRetracement(ohlcvData, {
 *   thresholdMultiplier: 2,
 *   useATRThreshold: true,
 *   atrPeriod: 14,
 *   depth: 10
 * });
 */
export function calculateFibRetracement(
  ohlcvData: OHLCV[],
  config: FibExtensionConfig = {},
): FibonacciLevels | null {
  const settings = {
    deviation: config.deviation ?? 5,
    depth: config.depth ?? 12,
    backstep: config.backstep ?? 2,
  }

  if (ohlcvData.length < settings.depth * 2) {
    return null
  }

  const pivots = zigzag(ohlcvData, {
    deviation: settings.deviation,
    depth: settings.depth,
    backstep: settings.backstep,
  })

  if (pivots.length < 3) {
    return null
  }

  // Get the last two pivots to form the swing
  const lastPivot = pivots[pivots.length - 1]
  const secondLastPivot = pivots[pivots.length - 2]

  const startTime = secondLastPivot.time
  const startPrice = secondLastPivot.price
  const endTime = lastPivot.time
  const endPrice = lastPivot.price

  const height = startPrice - endPrice
  const isUptrend = height < 0
  const levels = calculateFibLevels(endPrice, height)

  return {
    startTime,
    startPrice,
    endTime,
    endPrice,
    height,
    isUptrend,
    levels,
  }
}

export function calculateFibExtension(
  ohlcvData: OHLCV[],
  config: FibExtensionConfig = {},
): FibonacciLevels | null {
  const settings = {
    deviation: config.deviation ?? 5,
    depth: config.depth ?? 12,
    backstep: config.backstep ?? 2,
  }

  if (ohlcvData.length < settings.depth * 2) {
    return null
  }

  const pivots = zigzag(ohlcvData, {
    deviation: settings.deviation,
    depth: settings.depth,
    backstep: settings.backstep,
  })

  if (pivots.length < 3) {
    return null
  }

  // Get the last two pivots to form the swing
  const lastPivot = pivots[pivots.length - 1]
  const secondLastPivot = pivots[pivots.length - 2]
  const thirdLastPivot = pivots[pivots.length - 3]

  const base = lastPivot.price
  const height = secondLastPivot.price - thirdLastPivot.price

  const isUptrend = height < 0
  const levels = calculateFibLevels(base, height)

  const startPrice = secondLastPivot.price
  const startTime = secondLastPivot.time
  const endPrice = lastPivot.price
  const endTime = lastPivot.time
  return {
    startTime,
    startPrice,
    endTime,
    endPrice,
    height,
    isUptrend,
    levels,
  }
}

function calculateFibLevels(base: number, height: number): FibLevel[] {
  return FIBONACCI_LEVELS.map(level => {
    const price = base + height * level // base = top, height = -diff
    return {
      level,
      price,
      percentage: level * 100,
    }
  })
}
