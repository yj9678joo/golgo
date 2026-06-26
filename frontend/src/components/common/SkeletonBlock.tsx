import { cn } from '@/lib/utils'

type SkeletonBlockProps = {
  className?: string
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cn('animate-pulse rounded-[18px] bg-white/70', className)} />
}
