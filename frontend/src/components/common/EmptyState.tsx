import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Card } from '@/components/ui/card'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="rounded-[18px] border-0 bg-white p-6 text-center shadow-none">
      <span className="mx-auto flex size-12 items-center justify-center rounded-[16px] bg-[#E9FBF6] text-[#03ba8c]">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold text-[#191F28]">{title}</h2>
      <p className="mt-2 text-[13px] leading-5 text-[#6B7684]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  )
}
