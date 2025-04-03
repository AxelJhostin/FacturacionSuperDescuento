export const formatMoney = (value: number): string => {
  return value.toFixed(2)
}

export const parseDecimal = (value: string | undefined): number => {
  const num = parseFloat(value || '0')
  return parseFloat(num.toFixed(2))
}