import type { ReactNode } from 'react'
import { MobilePage } from '@/components/layout/MobilePage'
import { BottomNav } from '@/components/layout/BottomNav'

type AppTabLayoutProps = {
  children: ReactNode
}

export function AppTabLayout({ children }: AppTabLayoutProps) {
  return (
    <MobilePage
      className="bg-[#F2F4F6] pb-24 text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="w-full px-2 py-4">{children}</div>
      <BottomNav />
    </MobilePage>
  )
}
