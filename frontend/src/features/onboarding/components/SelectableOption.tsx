import type { ComponentType } from 'react'
import { Check } from 'lucide-react'

type SelectableOptionProps = {
  icon?: ComponentType<{ className?: string }>
  title: string
  description: string
  selected: boolean
  badge?: string
  onClick: () => void
}

export function SelectableOption({
  icon: Icon,
  title,
  description,
  selected,
  badge,
  onClick,
}: SelectableOptionProps) {
  return (
    <button
      className={
        selected
          ? 'flex w-full items-center gap-3 rounded-[16px] border border-[#191F28] bg-white p-3.5 text-left shadow-sm'
          : 'flex w-full items-center gap-3 rounded-[16px] border border-[#E5E8EB] bg-white p-3.5 text-left'
      }
      type="button"
      onClick={onClick}
    >
      <span
        className={
          selected
            ? 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#191F28] text-white'
            : 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4F6] text-[#4E5968]'
        }
      >
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : badge}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[#191F28]">
          {title}
        </span>
        <span className="mt-1 block text-[12px] leading-5 text-[#6B7684]">
          {description}
        </span>
      </span>
      <span
        className={
          selected
            ? 'flex size-5 shrink-0 items-center justify-center rounded-full bg-[#191F28] text-white'
            : 'size-5 shrink-0 rounded-full border border-[#DDE2E7]'
        }
      >
        {selected ? <Check className="size-3" aria-hidden="true" /> : null}
      </span>
    </button>
  )
}
