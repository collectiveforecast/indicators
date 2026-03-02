import { DEFAULT_PERIOD } from "../indicators.constants"
import { OHLCV, MFIPremiumParams } from "../indicators.interface"
import { calculateMFI } from "./mfi.indicator"

export function calculateMFIPremium(data: OHLCV[], params?: MFIPremiumParams) {
  const { period = DEFAULT_PERIOD } = params || {}

  const mfiPremiumData: number[] = []
  const adjustmentFactor = 1.05
  const mfiData = calculateMFI(data, { period })

  for (let i = 0; i < mfiData.length; i++) {
    mfiPremiumData.push(mfiData[i] * adjustmentFactor)
  }

  return mfiPremiumData
}
