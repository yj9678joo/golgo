import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type MobilePageProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function MobilePage({ children, className, contentClassName }: MobilePageProps) {
  return (
    <main
      className={cn(
        'min-h-[100svh] bg-background px-4 py-4 text-foreground [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-top:max(1rem,env(safe-area-inset-top))]',
        className,
      )}
    >
      <section className={cn('mx-auto min-h-[calc(100svh-2rem)] w-full max-w-[430px]', contentClassName)}>
        {children}
      </section>
    </main>
  )
}
