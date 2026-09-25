import { OHLCV } from "../../indicators.interface"
import { Pivot, ZigZagConfig } from "./zigzag.interface"

/**
 * ZigZag Indicator - Pine Script Port
 * Simulates Pine Script execution model: processes candles sequentially bar-by-bar
 */
export class ZigZagInstrument {
  // Configuration parameters (matching Pine Script function signature)
  private depth: number
  private deviation: number
  private backstep: number
  private mintick: number

  // State variables (var in Pine Script = persistent across bars)
  private direction: number = 1
  private z: { time: number; price: number; index: number } | null = null
  private z1: { time: number; price: number; index: number } | null = null
  private z2: { time: number; price: number; index: number } | null = null

  // Tracking previous values for ta.change()
  private previousDirection: number | null = null

  // Historical data storage for lookback calculations
  private candles: OHLCV[] = []
  private currentBarIndex: number = 0

  // Condition history tracking (Pine Script series simulation)
  private hrConditionHistory: boolean[] = []
  private lrConditionHistory: boolean[] = []
  private hrLrComparisonHistory: boolean[] = []
  private directionHistory: number[] = []

  // Store z1 and z2 per bar for pivot extraction
  private z1History: Array<{ time: number; price: number; index: number } | null> = []
  private z2History: Array<{ time: number; price: number; index: number } | null> = []

  constructor(
    depth: number = 12,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars -- positional, and re-enabled once min tick size is available
    deviation: number = 0,
    backstep: number = 2,
    mintick: number = 0.01,
  ) {
    this.depth = depth

    //disable deviation for now, uncoment when we can fetch min tick size
    this.deviation = 0
    // this.deviation = deviation;
    this.backstep = backstep
    this.mintick = mintick
  }

  /**
   * Main calculation method - simulates Pine Script bar-by-bar execution
   * Call this for each candle sequentially to build the indicator state
   */
  public calculate(candles: OHLCV[]): {
    direction: number
    z1: { time: number; price: number; index: number } | null
    z2: { time: number; price: number; index: number } | null
  } {
    this.candles = candles

    // Reset ALL state for fresh calculation (including persistent vars)
    this.hrConditionHistory = []
    this.lrConditionHistory = []
    this.hrLrComparisonHistory = []
    this.directionHistory = []
    this.z1History = []
    this.z2History = []
    this.direction = 1
    this.z = null
    this.z1 = null
    this.z2 = null
    this.previousDirection = null

    // Iterate through each bar (Pine Script execution model)
    for (let i = 0; i < candles.length; i++) {
      this.currentBarIndex = i
      this.processBar()
    }

    return {
      direction: this.direction,
      z1: this.z1,
      z2: this.z2,
    }
  }

  /**
   * Process a single bar - this is where the Pine Script logic will go
   * Pine Script runs this logic once per bar
   */
  private processBar(): void {
    const candle = this.candles[this.currentBarIndex]
    const low = candle.low
    const high = candle.high

    // Step 1: Evaluate current bar's hr and lr conditions
    const hrCondition = this.evaluateHrCondition()
    const lrCondition = this.evaluateLrCondition()

    // Store the conditions in history
    this.hrConditionHistory.push(hrCondition)
    this.lrConditionHistory.push(lrCondition)

    // Step 2: Get previous bar's condition using [1]
    /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars -- kept to mirror the Pine source */
    const hrCondition_prev = this.prev(this.hrConditionHistory, 1) ?? true
    const lrCondition_prev = this.prev(this.lrConditionHistory, 1) ?? true
    /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

    // Step 3: Calculate hr and lr using barssince on previous condition
    // hr = ta.barssince(not (...)[1]) means we look for when the previous condition was true
    let hr = 0
    let lr = 0

    if (this.hrConditionHistory.length > 1) {
      // Create a temporary array with previous conditions for barssince
      const hrPrevConditions = this.hrConditionHistory.slice(0, -1)
      hr = hrPrevConditions.length > 0 ? this.barssince(hrPrevConditions) : 0
    }

    if (this.lrConditionHistory.length > 1) {
      const lrPrevConditions = this.lrConditionHistory.slice(0, -1)
      lr = lrPrevConditions.length > 0 ? this.barssince(lrPrevConditions) : 0
    }

    // Step 4: Calculate hr > lr comparison and store in history
    const hrLrComparison = hr > lr
    this.hrLrComparisonHistory.push(hrLrComparison)

    // Step 5: Calculate direction
    // direction = ta.barssince(not (hr > lr)) >= backstep ? -1 : 1
    const notHrLrHistory = this.hrLrComparisonHistory.map(val => !val)
    const barsSinceNotHrLr = this.barssince(notHrLrHistory)
    this.direction = barsSinceNotHrLr >= this.backstep ? -1 : 1

    // Store direction in history
    this.directionHistory.push(this.direction)

    // Step 6: Initialize var variables on first bar
    if (this.currentBarIndex === 0) {
      this.z = this.createPoint(low)
      this.z1 = this.createPoint(low)
      this.z2 = this.createPoint(high)
      this.previousDirection = this.direction
      this.z1History.push(this.z1 ? { ...this.z1 } : null)
      this.z2History.push(this.z2 ? { ...this.z2 } : null)
      return
    }

    // Step 7: Handle direction change (ta.change(direction))
    const directionChanged = this.change(this.direction, this.previousDirection)

    if (directionChanged) {
      // z1 := z2.copy()
      this.z1 = this.z2 ? { ...this.z2 } : null
      // z2 := z.copy()
      this.z2 = this.z ? { ...this.z } : null
    }

    // Step 8: Update zigzag points based on direction
    if (this.direction > 0) {
      // Uptrend logic
      if (this.z2 && high > this.z2.price) {
        this.z2 = this.createPoint(high)
        this.z = this.createPoint(low)
      }
      if (this.z && low < this.z.price) {
        this.z = this.createPoint(low)
      }
    }

    if (this.direction < 0) {
      // Downtrend logic
      if (this.z2 && low < this.z2.price) {
        this.z2 = this.createPoint(low)
        this.z = this.createPoint(high)
      }
      if (this.z && high > this.z.price) {
        this.z = this.createPoint(high)
      }
    }

    // Update previous direction for next bar
    this.previousDirection = this.direction

    // Store z1 and z2 snapshots for this bar
    this.z1History.push(this.z1 ? { ...this.z1 } : null)
    this.z2History.push(this.z2 ? { ...this.z2 } : null)
  }

  /**
   * Evaluate the hr condition for current bar
   * Condition: NOT (_high[-ta.highestbars(depth)] - _high > deviation*mintick)
   */
  private evaluateHrCondition(): boolean {
    const highestOffset = this.highestbars(this.depth)
    const highestHigh = this.getPreviousValue(highestOffset, "high")
    const currentHigh = this.candles[this.currentBarIndex].high

    if (highestHigh === null) {
      return true // Default when not enough data
    }

    // NOT (highestHigh - currentHigh > deviation*mintick)
    return !(highestHigh - currentHigh > this.deviation * this.mintick)
  }

  /**
   * Evaluate the lr condition for current bar
   * Condition: NOT (_low - _low[-ta.lowestbars(depth)] > deviation*mintick)
   */
  private evaluateLrCondition(): boolean {
    const lowestOffset = this.lowestbars(this.depth)
    const lowestLow = this.getPreviousValue(lowestOffset, "low")
    const currentLow = this.candles[this.currentBarIndex].low

    if (lowestLow === null) {
      return true // Default when not enough data
    }

    // NOT (currentLow - lowestLow > deviation*mintick)
    return !(currentLow - lowestLow > this.deviation * this.mintick)
  }

  /**
   * Pine Script helper: ta.highestbars(length)
   * Returns the offset to the highest value in the series (negative offset)
   * Returns the OLDEST (first) occurrence when there are ties
   * Example: if highest high is 3 bars ago, returns -3
   */
  private highestbars(length: number): number {
    if (this.currentBarIndex < length - 1) {
      return 0
    }

    let highestPrice = -Infinity
    let highestOffset = 0

    // Scan from oldest to newest (backwards) to get first occurrence
    for (let i = length - 1; i >= 0; i--) {
      const lookbackIndex = this.currentBarIndex - i
      if (lookbackIndex >= 0) {
        const high = this.candles[lookbackIndex].high
        if (high >= highestPrice) {
          highestPrice = high
          highestOffset = -i // Pine Script returns negative offset
        }
      }
    }

    return highestOffset
  }

  /**
   * Pine Script helper: ta.lowestbars(length)
   * Returns the offset to the lowest value in the series (negative offset)
   * Returns the OLDEST (first) occurrence when there are ties
   * Example: if lowest low is 2 bars ago, returns -2
   */
  private lowestbars(length: number): number {
    if (this.currentBarIndex < length - 1) {
      return 0
    }

    let lowestPrice = Infinity
    let lowestOffset = 0

    // Scan from oldest to newest (backwards) to get first occurrence
    for (let i = length - 1; i >= 0; i--) {
      const lookbackIndex = this.currentBarIndex - i
      if (lookbackIndex >= 0) {
        const low = this.candles[lookbackIndex].low
        if (low <= lowestPrice) {
          lowestPrice = low
          lowestOffset = -i // Pine Script returns negative offset
        }
      }
    }

    return lowestOffset
  }

  /**
   * Pine Script helper: ta.barssince(condition)
   * Returns number of bars since condition was true
   * Scans backward through condition history to find last true value
   */
  private barssince(conditionHistory: boolean[]): number {
    if (conditionHistory.length === 0) {
      return 0
    }

    // Find the most recent bar where condition was true
    for (let i = conditionHistory.length - 1; i >= 0; i--) {
      if (conditionHistory[i]) {
        return conditionHistory.length - 1 - i
      }
    }
    // If condition was never true, return the bar count
    return conditionHistory.length
  }

  /**
   * Pine Script helper: ta.change(series)
   * Returns true if current value differs from previous value
   */
  private change(currentValue: number, previousValue: number | null): boolean {
    if (previousValue === null) {
      return false
    }
    return currentValue !== previousValue
  }

  /**
   * Pine Script helper: Get previous value from array (implements [barsAgo] operator)
   * Example: prev(array, 1) gets value from 1 bar ago
   */
  private prev<T>(arr: T[], barsAgo: number): T | undefined {
    const index = arr.length - 1 - barsAgo
    if (index < 0 || index >= arr.length) {
      return undefined
    }
    return arr[index]
  }

  /**
   * Get direction, z1, and z2 history for pivot extraction
   */
  public getHistory(): {
    directionHistory: number[]
    z1History: Array<{ time: number; price: number; index: number } | null>
    z2History: Array<{ time: number; price: number; index: number } | null>
  } {
    return {
      directionHistory: [...this.directionHistory],
      z1History: [...this.z1History],
      z2History: [...this.z2History],
    }
  }

  /**
   * Helper to create a point (chart.point.now in Pine Script)
   */
  private createPoint(price: number): { time: number; price: number; index: number } {
    const candle = this.candles[this.currentBarIndex]
    return {
      time: candle.time,
      price: price,
      index: this.currentBarIndex,
    }
  }

  /**
   * Helper to get previous bar value (bracket notation in Pine Script)
   * Pine Script: _high[-3] means 3 bars ago (negative offset)
   * So offset is already negative, we add it to currentBarIndex
   */
  private getPreviousValue(negativeOffset: number, field: "high" | "low"): number | null {
    const targetIndex = this.currentBarIndex + negativeOffset // negativeOffset is already negative
    if (targetIndex < 0 || targetIndex >= this.candles.length) {
      return null
    }
    return this.candles[targetIndex][field]
  }
}

/**
 * Main zigzag function that processes candles and returns confirmed pivot points
 * Mimics the Pine Script indicator logic that confirms pivots on direction changes
 *
 * @param candles - Array of OHLCV candles to analyze
 * @param config - ZigZag configuration (depth, deviation, backstep, mintick)
 * @returns Array of confirmed swing points (pivots)
 *
 * @example
 * ```typescript
 * const pivots = zigzag(candles, { depth: 12, deviation: 5, backstep: 2, mintick: 0.01 });
 * // Returns: [
 * //   { time: 1234567890, direction: 'up', value: 50.25 },    // Low pivot
 * //   { time: 1234567900, direction: 'down', value: 51.75 },  // High pivot
 * //   ...
 * // ]
 * ```
 */
export function zigzag(candles: OHLCV[], config?: Partial<ZigZagConfig>): Pivot[] {
  if (candles.length === 0) {
    return []
  }

  const instrument = new ZigZagInstrument(
    config?.depth ?? 12,
    config?.deviation ?? 5,
    config?.backstep ?? 2,
    config?.mintick ?? 0.01,
  )

  // Calculate once for all candles
  instrument.calculate(candles)

  // Get history
  const { directionHistory, z1History, z2History } = instrument.getHistory()

  const pivots: Pivot[] = []

  // Iterate through history to find direction changes
  for (let i = 1; i < directionHistory.length; i++) {
    const currentDirection = directionHistory[i]
    const previousDirection = directionHistory[i - 1]

    // Detect direction change
    if (currentDirection !== previousDirection) {
      // When direction changes, z1 on THIS bar becomes the confirmed pivot
      // (because in processBar we did: z1 := z2.copy())
      const confirmedPivot = z1History[i]

      if (confirmedPivot) {
        // Determine if this is a high or low pivot
        // When changing FROM bullish TO bearish: we just finished an uptrend, so it's a HIGH
        // When changing FROM bearish TO bullish: we just finished a downtrend, so it's a LOW
        const isHighPivot = previousDirection > 0

        pivots.push({
          time: confirmedPivot.time,
          price: confirmedPivot.price,
          isHigh: isHighPivot,
        })
      }
    }
  }

  // Add the last unconfirmed pivot (z2 on the last bar)
  // This matches Pine Script behavior: line.new(z1, z2) draws to current z2 even if not confirmed
  const lastZ2 = z2History[z2History.length - 1]
  const lastDirection = directionHistory[directionHistory.length - 1]

  if (lastZ2) {
    // Current direction tells us what type of pivot z2 is tracking
    // If direction is bullish (1), z2 is tracking a HIGH (the peak we're moving away from)
    // If direction is bearish (-1), z2 is tracking a LOW (the trough we're moving away from)
    const isHighPivot = lastDirection > 0

    pivots.push({
      time: lastZ2.time,
      price: lastZ2.price,
      isHigh: isHighPivot,
    })
  }

  return pivots
}
