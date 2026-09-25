/**
 * Explicit re-exports rather than `export *`.
 *
 * `Pivot`, `SwingPoint`, `ZigZagConfig`, `ChartPoint`, `InternalPivot`,
 * `ZigZagState`, `Divergence` and `DivergenceType` are each declared in more
 * than one of the interface files below — legacy copies that predate these
 * instruments sharing a folder. Starring them out makes that ambiguous, and
 * picking an owner per type here settles it without rewriting ported code.
 *
 * Note that the two `ZigZagConfig` declarations are not the same shape: the one
 * `zigzag()` actually accepts is zigzag's. The others are unused.
 */

export { zigzag } from "./zigzag/zigzag.instrument"
export type { Pivot, ZigZagConfig } from "./zigzag/zigzag.interface"

export { calculateFibExtension, calculateFibRetracement } from "./fibonacci/fibonacci.instrument"
export { FIBONACCI_LEVELS, fibonacciLevels } from "./fibonacci/fibonacci.interface"
export type {
  FibExtensionConfig,
  FibLevel,
  FibonacciExtendResult,
  FibonacciLevelObject,
  FibonacciLevelType,
  FibonacciLevels,
} from "./fibonacci/fibonacci.interface"

export { default as detectDivergences } from "./divergence/divergence.instrument"
export {
  divergenceConfigForTimeframe,
  tfToDivergenceConfigs,
} from "./divergence/divergence.constants"
export type {
  Divergence,
  DivergenceConfig,
  DivergenceType,
  IndexedSwingPoint,
  SwingPoint,
} from "./divergence/divergence.interface"

export { calculateZones } from "./zones/zones.instrument"
export { DEFAULT_ZONES_CONFIG, ZONE_STRENGTH_THRESHOLDS } from "./zones/zones.constants"
export type {
  SupportResistanceZone,
  ZoneKind,
  ZoneStrength,
  ZonesConfig,
} from "./zones/zones.interface"
