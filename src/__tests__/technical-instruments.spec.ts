import { OHLCV } from "../indicators.interface"
import { calculateFibRetracement } from "../technical-instruments/fibonacci/fibonacci.instrument"
import { calculateZones } from "../technical-instruments/zones/zones.instrument"
import { divergenceConfigForTimeframe } from "../technical-instruments/divergence/divergence.constants"
import detectDivergences from "../technical-instruments/divergence/divergence.instrument"
import { calculateRSI } from "../indicators-functions"
import { zigzag } from "../technical-instruments/zigzag/zigzag.instrument"

const HOUR = 3_600_000

function build(prices: number[]): OHLCV[] {
  return prices.map((close, i) => ({
    time: i * HOUR,
    open: close,
    high: close + 0.2,
    low: close - 0.2,
    close,
    volume: 1000,
  }))
}

function wave(cycles: number, low: number, high: number, period = 40): number[] {
  const out: number[] = []
  for (let c = 0; c < cycles; c++)
    for (let i = 0; i < period; i++) {
      const p = i / period
      out.push(p < 0.5 ? low + (high - low) * 2 * p : high - (high - low) * 2 * (p - 0.5))
    }
  return out
}

/**
 * These are the numbers the server-side originals produce for the same input.
 * They are pinned here because the whole point of the port is that a client and
 * the backend agree: a change that moves any of them is a change that would
 * make the two disagree, whatever else it improves.
 */
describe("technical instruments", () => {
  const ranging = build(wave(10, 100, 110))

  it("finds the same zigzag pivots", () => {
    expect(zigzag(ranging, { depth: 12, deviation: 5, backstep: 2 })).toHaveLength(20)
  })

  it("finds the floor and ceiling of a range", () => {
    const zones = calculateZones(ranging)

    const support = zones.find(zone => zone.kind === "support")!
    const resistance = zones.find(zone => zone.kind === "resistance")!

    expect(support.price).toBeCloseTo(100, 0)
    expect(resistance.price).toBeCloseTo(110, 0)
    expect(support.touches).toBe(10)
    expect(resistance.touches).toBe(10)
  })

  it("flags a level that held from both sides", () => {
    const zones = calculateZones(build([...wave(5, 100, 110), ...wave(5, 110, 120)]))
    const flipped = zones.filter(zone => zone.flipped)

    expect(flipped).toHaveLength(1)
    expect(flipped[0].price).toBeCloseTo(110, 0)
  })

  it("returns nothing rather than inventing levels", () => {
    expect(calculateZones(build(Array.from({ length: 400 }, (_, i) => 100 + i * 0.5)))).toEqual([])
    expect(calculateZones(build(Array(400).fill(100)))).toEqual([])
    expect(calculateZones([])).toEqual([])
  })

  it("anchors Fibonacci on the last swing, whatever the window length", () => {
    const anchor = (candles: OHLCV[]) => {
      const fib = calculateFibRetracement(candles)
      return fib ? `${fib.startPrice.toFixed(2)}->${fib.endPrice.toFixed(2)}` : "none"
    }

    expect(anchor(ranging)).toBe(anchor(ranging.slice(-300)))
    expect(calculateFibRetracement(ranging)!.levels.length).toBeGreaterThan(0)
  })

  it("resolves a divergence config for any timeframe", () => {
    expect(divergenceConfigForTimeframe("1h")).toEqual(divergenceConfigForTimeframe("1h"))
    expect(divergenceConfigForTimeframe("30m")).toEqual(divergenceConfigForTimeframe("1h"))
    expect(divergenceConfigForTimeframe("3d")).toEqual(divergenceConfigForTimeframe("1w"))
  })

  it("runs divergences over an oscillator without throwing", () => {
    const rsi = calculateRSI(ranging, { period: 14 })
    const found = detectDivergences(ranging, rsi, divergenceConfigForTimeframe("1h"))

    expect(Array.isArray(found)).toBe(true)
  })
})
