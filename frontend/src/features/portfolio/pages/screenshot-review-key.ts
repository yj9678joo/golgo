import type { Holding } from '@/features/portfolio/types'

export function getHoldingRowKey(
  holding: Pick<Holding, 'symbol' | 'name'>,
  index: number,
) {
  return holding.symbol || `${holding.name}-${index}`
}
