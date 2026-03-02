import { OHLCV, MFIParams } from "../indicators.interface"
import { DEFAULT_PERIOD } from "../indicators.constants"

export function calculateMFI(data: OHLCV[], params?: MFIParams) {
  const { period = DEFAULT_PERIOD } = params || {}
  const mfiData: number[] = []

  const typicalPrices = data.map(
    item => (Number(item.high) + Number(item.low) + Number(item.close)) / 3,
  )
  const moneyFlows = typicalPrices.map((tp, idx) => tp * data[idx].volume)
  const positiveMoneyFlow: number[] = []
  const negativeMoneyFlow: number[] = []

  for (let i = 1; i < typicalPrices.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveMoneyFlow.push(moneyFlows[i])
      negativeMoneyFlow.push(0)
    } else if (typicalPrices[i] < typicalPrices[i - 1]) {
      positiveMoneyFlow.push(0)
      negativeMoneyFlow.push(moneyFlows[i])
    } else {
      positiveMoneyFlow.push(0)
      negativeMoneyFlow.push(0)
    }
  }

  for (let i = period; i < typicalPrices.length; i++) {
    const posFlowSum = positiveMoneyFlow.slice(i - period, i).reduce((a, b) => a + b, 0)
    const negFlowSum = negativeMoneyFlow.slice(i - period, i).reduce((a, b) => a + b, 0)
    const moneyRatio = posFlowSum / (negFlowSum || 1)
    const mfiValue = 100 - 100 / (1 + moneyRatio)

    mfiData.push(mfiValue)
  }

  return mfiData
}
