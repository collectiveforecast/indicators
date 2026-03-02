# Cofo Indicators

A TypeScript library providing a collection of **technical indicators** and utility functions for financial OHLCV data analysis.

---

## Features

- Popular technical indicators like **SMA, EMA, RSI, MACD, Stochastic, ATR, CCI**, and more.
- Flexible **indicator calculation** with custom parameters.
- Attach indicators directly to OHLCV datasets.
- Format indicator values for display.
- Fully typed with TypeScript.

---

## Installation

```bash
npm install cofo-indicators
```

## Import functions

```ts
import {
  attachIndicators,
  calculateIndicator,
  formatIndicatorNumbers,
  indicatorsCalculatorsMap,
  getIndicatorTypes,
} from "cofo-indicators"
```

## Basic example: attach indicators

```ts
import { OHLCV, IndicatorTypeMap } from "cofo-indicators"

const data: OHLCV[] = [
  { open: 1, high: 3, low: 1, close: 1, time: 1, volume: 100 },
  { open: 2, high: 4, low: 2, close: 2, time: 2, volume: 110 },
  { open: 3, high: 5, low: 3, close: 3, time: 3, volume: 120 },
]

const indicators = {
  [IndicatorTypeMap.SMA]: { period: 3 },
  [IndicatorTypeMap.RSI]: { period: 14 },
}

const result = attachIndicators({
  data,
  indicators,
  formatNumbers: true,
})

console.log(result)
```

## Calculate a single indicator

```ts
import { calculateIndicator, IndicatorTypeMap } from "cofo-indicators"

const smaValues = calculateIndicator({
  indicator: IndicatorTypeMap.SMA,
  data,
  params: { period: 3 },
})

console.log(smaValues)
```

**OR**

```ts
import { calculateSMA } from "cofo-indicators"

const smaValues = calculateSMA(data, { period: 3 })

console.log(smaValues)
```

## Format indicator numbers

```ts
import { formatIndicatorNumbers } from "cofo-indicators"

const result = attachIndicators(...)
const formatted = formatIndicatorNumbers(result)

console.log(formatted)
```

## Functions

| Function                                                | Description                                 |
| ------------------------------------------------------- | ------------------------------------------- |
| `attachIndicators({ data, indicators, formatNumbers })` | Attach multiple indicators to OHLCV data.   |
| `calculateIndicator({ indicator, data, params })`       | Calculate a single indicator.               |
| `calculateSMA(data) - SMA, CTI, ZLMA etc.`              | Another way to calculate a single indicator |
| `formatIndicatorNumbers(data)`                          | Format indicators for display.              |
| `getIndicatorTypes()`                                   | Get all available indicator types.          |


## Supported Indicators

- **SMA** – Simple Moving Average
- **EMA** – Exponential Moving Average
- **RSI** – Relative Strength Index
- **MACD** – Moving Average Convergence Divergence
- **Stochastic** – Stochastic Oscillator
- **Coppock** – Coppock Curve
- **Random** – Random Indicator
- **Impulse** – Impulse System
- **RVGI** – Relative Vigor Index
- **ZLMA** – Zero-Lag Moving Average
- **MFI** – Money Flow Index
- **MFIPremium** – Premium Money Flow Index
- **CCI** – Commodity Channel Index
- **KDJ** – Stochastic KDJ
- **CTI** – Correlation Trend Indicator
- **Boillinger** – Bollinger %B
- **ATR** – Average True Range
- **FibRetracement** – Fibonacci Retracement Levels
- **ZigZag** – ZigZag Pivot Detection  
- **Divergence** – Divergence between price and indicator

## Types

| Type                            | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `OHLCV`                         | `{ open, high, low, close, time, volume }`  |
| `OHLCVWithIndicators`           | `OHLCV` extended with calculated indicators |
| `IndicatorType`                 | String literal union of all indicator types |
| `IndicatorParamsMap`            | Mapping of indicator type → parameter type  |
| `CalculateIndicatorFunction<T>` | Typed function for indicator calculation.   |
