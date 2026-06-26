import type { Holding } from '@/features/portfolio/types'

export function replaceHoldingAt(
  holdings: Holding[],
  index: number,
  next: Holding,
) {
  return holdings.map((holding, holdingIndex) =>
    holdingIndex === index ? next : holding,
  )
}
