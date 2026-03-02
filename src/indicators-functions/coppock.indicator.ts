import { OHLCV, CoppockParams } from "../indicators.interface"

export function calculateCOPPOCK(data: OHLCV[], params?: CoppockParams) {
  const { periodROC1 = 14, periodROC2 = 11, periodWMA = 10 } = params || {}

  if (!data || data.length < Math.max(periodROC1, periodROC2) + periodWMA) {
    throw new Error("Not enough data to calculate Coppock Curve")
  }

  const roc14 = calculateROC(data, periodROC1)
  const roc11 = calculateROC(data, periodROC2)

  const rocSum = roc14.map((value, index) => value + roc11[index])

  const coppock = calculateWMA(rocSum, periodWMA)

  return coppock
}

function calculateROC(data: OHLCV[], period: number) {
  const rocData: number[] = []

  for (let i = period; i < data.length; i++) {
    const close = data[i].close
    const closePeriod = data[i - period].close
    rocData.push(((close - closePeriod) / closePeriod) * 100)
  }
  return rocData
}

function calculateWMA(values: number[], length: number) {
  const wmaData: number[] = new Array(values.length).fill(0)
  const denominator = (length * (length + 1)) / 2

  for (let i = length - 1; i < values.length; i++) {
    let sum = 0
    for (let j = 0; j < length; j++) {
      sum += values[i - j] * (length - j)
    }
    wmaData[i] = sum / denominator
  }

  return wmaData
}
