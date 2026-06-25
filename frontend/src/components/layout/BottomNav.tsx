import { BarChart3, Bot, Home, PieChart } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', label: '홈', icon: Home },
  { to: '/portfolio', label: '포트폴리오', icon: PieChart },
  { to: '/analysis', label: 'AI분석', icon: Bot },
  { to: '/rebalancing', label: '리밸런싱', icon: BarChart3 },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#E5E8EB] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-[430px] grid-cols-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            className={({ isActive }) =>
              cn(
                'flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-[#8B95A1]',
                isActive && 'text-[#03ba8c]',
              )
            }
            to={tab.to}
          >
            <tab.icon className="size-5" aria-hidden="true" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
