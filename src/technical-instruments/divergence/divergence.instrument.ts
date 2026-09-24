import { OHLCV } from "../../indicators.interface"
import {
  Divergence,
  DivergenceConfig,
  DivergenceType,
  IndexedSwingPoint,
  SwingPoint,
} from "./divergence.interface"

export default function detectDivergences(
  candles: OHLCV[],
  rawIndicatorData: number[],
  config: DivergenceConfig,
): Divergence[] {
  let indicatorData: Array<number | null> = []

  if (rawIndicatorData.length < candles.length) {
    indicatorData = Array(candles.length - rawIndicatorData.length)
      .fill(null)
      .concat(rawIndicatorData)
  } else {
    indicatorData = rawIndicatorData
  }

  const {
    pivotLookbackLeft,
    pivotLookbackRight,
    strengthThreshold,
    minLookbackRange = 5,
    maxLookbackRange = 60,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars -- accepted by DivergenceConfig but never applied; see note in the interface
    smoothingLength = 3,
    minDistance = 2,
    validateDivergence = false,
    attachHidden = false,
  } = config

  const divergences: Divergence[] = []

  if (candles.length < pivotLookbackLeft + pivotLookbackRight) return divergences

  // const smoothedIndicator = simpleSMA(indicatorData, smoothingLength);

  // 2) Find pivots
  const indicatorPivots = findPivots(indicatorData, pivotLookbackLeft, pivotLookbackRight).filter(
    (p, i, arr) => {
      if (i === 0) return true
      return Math.abs(p.index - arr[i - 1].index) >= minDistance
    },
  )

  const highPivots = indicatorPivots.filter(p => p.direction === "up")
  const lowPivots = indicatorPivots.filter(p => p.direction === "down")

  const pivotPairs: [IndexedSwingPoint, IndexedSwingPoint, "up" | "down"][] = []

  for (let i = 0; i <= highPivots.length - 2; i++) {
    const p1 = highPivots[i]
    const p2 = highPivots[i + 1]

    const range = Math.abs(p2.index - p1.index)
    if (range < minLookbackRange) continue
    if (range > maxLookbackRange) continue

    pivotPairs.push([p1, p2, "up"])
  }

  for (let i = 0; i <= lowPivots.length - 2; i++) {
    const p1 = lowPivots[i]
    const p2 = lowPivots[i + 1]

    const range = Math.abs(p2.index - p1.index)
    if (range < minLookbackRange) continue
    if (range > maxLookbackRange) continue

    pivotPairs.push([p1, p2, "down"])
  }

  for (const [swing1, swing2, direction] of pivotPairs) {
    const analysis = analyzePair(swing1, swing2, candles, direction)
    if (!attachHidden && (analysis === "hidden_bullish" || analysis === "hidden_bearish")) {
      continue
    }
    if (analysis) {
      const [priceSwing1, priceSwing2] = findPriceSwings(swing1, swing2, candles, direction)
      if (validateDivergence) {
        const isValid = isValidDivergence(analysis, candles, swing1, swing2)
        if (!isValid) continue
      }
      divergences.push({
        type: analysis,
        indicatorSwing1: convertIndexSwingToNormalSwing(swing1, candles),
        indicatorSwing2: convertIndexSwingToNormalSwing(swing2, candles),
        priceSwing1,
        priceSwing2,
        strength: Math.abs(swing2.value - swing1.value) >= strengthThreshold ? "strong" : "weak",
      })
    }
  }

  return divergences
}

function isValidDivergence(
  divergenceType: DivergenceType,
  data: OHLCV[],
  swing1: IndexedSwingPoint,
  swing2: IndexedSwingPoint,
): boolean {
  switch (divergenceType) {
    case "bullish": {
      const lowestSwingIndex = swing1.value < swing2.value ? swing1.index : swing2.index
      const relevantData = data.slice(lowestSwingIndex, Math.max(swing1.index, swing2.index) + 1)
      for (const candle of relevantData) {
        if (candle.low < Math.min(swing1.value, swing2.value)) {
          return false
        }
      }
      return true
    }
    case "bearish": {
      const highestSwingIndex = swing1.value > swing2.value ? swing1.index : swing2.index
      const relevantDataBear = data.slice(
        highestSwingIndex,
        Math.max(swing1.index, swing2.index) + 1,
      )
      for (const candle of relevantDataBear) {
        if (candle.high > Math.max(swing1.value, swing2.value)) {
          return false
        }
      }
      return true
    }
    default:
      return true
  }
}

function analyzePair(
  indicatorSwing1: IndexedSwingPoint,
  indicatorSwing2: IndexedSwingPoint,
  priceData: OHLCV[],
  pivotType?: "up" | "down",
): DivergenceType | null {
  const priceSwing1Value = priceData[indicatorSwing1.index]
  const priceSwing2Value = priceData[indicatorSwing2.index]

  if (pivotType === "up") {
    if (priceSwing1Value.high < priceSwing2Value.high) {
      // Price makes higher high, indicator makes lower high
      if (indicatorSwing1.value > indicatorSwing2.value) {
        return "bearish"
      }
    } else if (priceSwing1Value.high > priceSwing2Value.high) {
      // Price makes lower high, indicator makes higher high
      if (indicatorSwing1.value < indicatorSwing2.value) {
        return "hidden_bearish"
      }
    }
  }

  if (pivotType === "down") {
    if (priceSwing1Value.low > priceSwing2Value.low) {
      // Price makes lower low, indicator makes higher low
      if (indicatorSwing1.value < indicatorSwing2.value) {
        return "bullish"
      }
    } else if (priceSwing1Value.low < priceSwing2Value.low) {
      // Price makes higher low, indicator makes lower low
      if (indicatorSwing1.value > indicatorSwing2.value) {
        return "hidden_bullish"
      }
    }
  }

  return null
}

function findPivots(
  rsi: Array<number | null>,
  lbL: number = 5,
  lbR: number = 5,
): IndexedSwingPoint[] {
  const pivots: IndexedSwingPoint[] = []

  for (let i = lbL; i < rsi.length - lbR; i++) {
    if (i === null) continue
    const center = rsi[i]

    const isLow =
      rsi.slice(i - lbL, i).every(v => (center as number) < (v as number)) &&
      rsi.slice(i + 1, i + 1 + lbR).every(v => (center as number) < (v as number))

    const isHigh =
      rsi.slice(i - lbL, i).every(v => (center as number) > (v as number)) &&
      rsi.slice(i + 1, i + 1 + lbR).every(v => (center as number) > (v as number))

    if (isLow || isHigh) {
      pivots.push({
        index: i,
        direction: isHigh ? "up" : "down",
        value: center as number,
      })
    }
  }

  return pivots
}

function convertIndexSwingToNormalSwing(indexSwing: IndexedSwingPoint, candles: OHLCV[]) {
  const swing: SwingPoint = {
    direction: indexSwing.direction,
    value: indexSwing.value,
    time: candles[indexSwing.index].time,
  }
  return swing
}

function findPriceSwings(
  indicatorSwing1: IndexedSwingPoint,
  indicatorSwing2: IndexedSwingPoint,
  candles: OHLCV[],
  direction: "up" | "down",
): [SwingPoint, SwingPoint] {
  const startIdx = indicatorSwing1.index
  const endIdx = indicatorSwing2.index

  // For 'up' pivots, we look at highs; for 'down' pivots, we look at lows
  if (direction === "up") {
    // Find the actual high at swing1 position
    const swing1High = candles[startIdx].high

    // Find the actual high at swing2 position
    const swing2High = candles[endIdx].high

    return [
      {
        direction: "up",
        value: swing1High,
        time: candles[startIdx].time,
      },
      {
        direction: "up",
        value: swing2High,
        time: candles[endIdx].time,
      },
    ]
  } else {
    // For down pivots, use lows
    const swing1Low = candles[startIdx].low
    const swing2Low = candles[endIdx].low

    return [
      {
        direction: "down",
        value: swing1Low,
        time: candles[startIdx].time,
      },
      {
        direction: "down",
        value: swing2Low,
        time: candles[endIdx].time,
      },
    ]
  }
}
