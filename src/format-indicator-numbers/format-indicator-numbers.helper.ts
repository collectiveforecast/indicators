export function dynamicFormatPriceValue(number: number | null): typeof number {
  if (typeof number !== "number" || isNaN(number)) return null

  if (number < 0.01 && number > -0.01) {
    return number
  }

  if (number < 0.1 && number > -0.1) {
    return formatNumber(number, 4)
  }

  if (number < 1 && number > -1) {
    return formatNumber(number, 2)
  }

  if (number < 100 && number > -100) {
    return formatNumber(number, 1)
  }

  return formatNumber(number, 0)
}

export function dynamicFormatPriceValueArray(prices: Array<number | null>): typeof prices {
  return prices.map(price => dynamicFormatPriceValue(price))
}

export function formatNumber(number: number | null, decimalPlaces: number): typeof number {
  if (typeof number !== "number" || isNaN(number)) return null

  return Number(number.toFixed(decimalPlaces))
}

export function formatNumberArray(
  number: Array<number | null>,
  decimalPlaces: number,
): typeof number {
  if (!number) return []

  return number.map(num => formatNumber(num, decimalPlaces))
}

export function compactNumber(number: number): string {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 3,
  })
  return formatter.format(number)
}
