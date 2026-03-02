import { OHLCV, RandomParams } from "../indicators.interface"
import { calculateSMA } from "./sma.indicator"

export function calculateRandom(
  data: OHLCV[],
  params: RandomParams = {
    length: 30,
    kdjLength: 3,
    kdjWeight: 1,
    buyThreshold: 25,
    sellThreshold: 75,
    smaLengths: {
      short: 13,
      medium: 26,
      long: 90,
    },
    leadingSmaLengths: {
      price: 21,
      range: 34,
    },
    leadingEmaLength: 4,
  },
) {
  const len = data.length

  const randomData = {
    k: new Array<number>(len).fill(0),
    d: new Array<number>(len).fill(0),
    leadingLine: new Array<number>(len).fill(0),
    buySignals: new Array<boolean>(len).fill(false),
    sellSignals: new Array<boolean>(len).fill(false),
    isLongZone: new Array<boolean>(len).fill(false),
    isShortZone: new Array<boolean>(len).fill(false),
  }

  // RSV
  const rsv = new Array(len).fill(0)
  for (let i = params.length - 1; i < len; i++) {
    const lows = data.slice(i - params.length + 1, i + 1).map(d => d.low)
    const highs = data.slice(i - params.length + 1, i + 1).map(d => d.high)

    const lowest = Math.min(...lows)
    const highest = Math.max(...highs)
    rsv[i] = ((data[i].close - lowest) / (highest - lowest || 1)) * 100
  }

  // K & D
  randomData.k = calculateXSA(rsv, params.kdjLength, params.kdjWeight)
  randomData.d = calculateXSA(randomData.k, params.kdjLength, params.kdjWeight)

  const var1 = new Array(len).fill(0)
  const var2 = new Array(len).fill(0)
  const var3 = new Array(len).fill(0)
  const var4 = new Array(len).fill(0)
  const var5 = new Array(len).fill(0)

  // SMA deviation
  for (
    let i = Math.max(params.smaLengths.short, params.smaLengths.medium, params.smaLengths.long) - 1;
    i < len;
    i++
  ) {
    const closes = data.slice(0, i + 1)

    const sma13 = calculateSMA(closes, { period: params.smaLengths.short })[i]
    const sma26 = calculateSMA(closes, {
      period: params.smaLengths.medium,
    })[i]
    const sma90 = calculateSMA(closes, { period: params.smaLengths.long })[i]

    var1[i] = ((data[i].close - sma13) / sma13) * 100
    var2[i] =
      ((data[i].close - sma26) /
        calculateSMA(closes, {
          period: params.leadingSmaLengths.price,
        })[i]) *
      100
    var3[i] =
      ((data[i].close - sma90) /
        calculateSMA(closes, {
          period: params.leadingSmaLengths.range,
        })[i]) *
      100
    var4[i] = (var1[i] + 3 * var2[i] + 9 * var3[i]) / 13
    var5[i] = 100 - Math.abs(var4[i])
  }

  // Leading line (EMA)
  for (let i = 10; i < len; i++) {
    const lows = data.slice(i - 10, i).map(d => d.low)
    const highs = data.slice(Math.max(0, i - 25), i).map(d => d.high)

    const lowest10 = Math.min(...lows)
    const highest25 = Math.max(...highs)
    const base = ((data[i].close - lowest10) / (highest25 - lowest10 || 1)) * 4

    if (i === 10) {
      randomData.leadingLine[i] = base * 25
    } else {
      const alpha = 2 / (params.leadingEmaLength + 1)
      randomData.leadingLine[i] = (base * alpha + randomData.leadingLine[i - 1] * (1 - alpha)) * 25
    }
  }

  // Signals
  for (let i = 1; i < len; i++) {
    const crossUnder =
      randomData.d[i - 1] >= randomData.k[i - 1] && randomData.d[i] < randomData.k[i]
    const crossOver =
      randomData.k[i - 1] >= randomData.d[i - 1] && randomData.k[i] < randomData.d[i]

    randomData.buySignals[i] = randomData.d[i] < params.buyThreshold && crossUnder
    randomData.sellSignals[i] = randomData.d[i] > params.sellThreshold && crossOver

    randomData.isLongZone[i] = randomData.k[i] >= randomData.d[i]
    randomData.isShortZone[i] = randomData.k[i] < randomData.d[i]
  }

  return randomData
}

function calculateXSA(src: number[], length: number, weight: number): number[] {
  const xsaData = new Array(src.length).fill(0)
  const sumf = new Array(src.length).fill(0)

  for (let i = 0; i < src.length; i++) {
    if (i >= length) {
      sumf[i] = sumf[i - 1] - src[i - length] + src[i]
    } else {
      let sum = 0
      for (let j = 0; j <= i; j++) {
        sum += src[j]
      }
      sumf[i] = sum
    }

    const ma = i >= length ? sumf[i] / length : sumf[i] / (i + 1)

    if (i === 0) {
      xsaData[i] = ma
    } else {
      xsaData[i] = (src[i] * weight + xsaData[i - 1] * (length - weight)) / length
    }
  }

  return xsaData
}
