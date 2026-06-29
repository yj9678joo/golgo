import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Holding } from '@/features/portfolio/types'

type HoldingEditSheetProps = {
  holding: Holding | null
  mode?: 'add' | 'edit'
  onClose: () => void
  onSave: (holding: Holding) => void
}

type NumberInputValue = number | ''
type HoldingEditForm = Omit<
  Holding,
  'quantity' | 'averagePrice' | 'currentPrice' | 'currentValueKrw'
> & {
  quantity: NumberInputValue
  averagePrice: NumberInputValue
  currentPrice: NumberInputValue
  currentValueKrw: NumberInputValue
}

export function HoldingEditSheet({
  holding,
  mode = 'edit',
  onClose,
  onSave,
}: HoldingEditSheetProps) {
  const [form, setForm] = useState<HoldingEditForm | null>(holding)

  useEffect(() => {
    setForm(holding)
  }, [holding])

  if (!holding || !form) {
    return null
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent
        className="bottom-4 w-[calc(100%-2rem)] rounded-[22px] bg-white p-5 shadow-xl"
        showClose={false}
      >
        <SheetHeader className="mb-4 space-y-0">
          <p className="text-[12px] font-semibold text-[#8B95A1]">
            {mode === 'add' ? '보유 종목 추가' : '보유 종목 수정'}
          </p>
          <SheetTitle className="mt-1 text-[20px] font-semibold text-[#191F28]">
            {mode === 'add' ? '새 종목' : holding.name}
          </SheetTitle>
        </SheetHeader>

        <div className="grid gap-3">
          <Field
            label="종목명"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />
          <Field
            label="종목코드"
            value={form.symbol}
            onChange={(value) => setForm({ ...form, symbol: value })}
          />
          <NumberField
            label="수량"
            value={form.quantity}
            onChange={(value) => setForm({ ...form, quantity: value })}
          />
          <NumberField
            label="평균단가"
            value={form.averagePrice}
            onChange={(value) => setForm({ ...form, averagePrice: value })}
          />
          <NumberField
            label="현재가"
            value={form.currentPrice}
            onChange={(value) => setForm({ ...form, currentPrice: value })}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            className="h-12 rounded-[14px] bg-[#F2F4F6] text-[14px] font-semibold text-[#4E5968]"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            닫기
          </Button>
          <Button
            className="h-12 rounded-[14px] bg-[#03ba8c] text-[14px] font-semibold text-white"
            type="button"
            onClick={() =>
              onSave(toHolding(form))
            }
          >
            {mode === 'add' ? '추가' : '저장'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function toHolding(form: HoldingEditForm): Holding {
  const quantity = toNumber(form.quantity)
  const averagePrice = toNumber(form.averagePrice)
  const currentPrice = toNumber(form.currentPrice)

  return {
    ...form,
    quantity,
    averagePrice,
    currentPrice,
    currentValueKrw: Number((quantity * currentPrice).toFixed(2)),
  }
}

function toNumber(value: NumberInputValue) {
  return value === '' ? 0 : value
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-[#6B7684]">{label}</span>
      <Input
        className="h-11 rounded-[12px] border border-[#E5E8EB] px-3 text-[16px] font-medium outline-none focus:border-[#03ba8c]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: NumberInputValue
  onChange: (value: NumberInputValue) => void
}) {
  return (
    <Label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-[#6B7684]">{label}</span>
      <Input
        className="h-11 rounded-[12px] border border-[#E5E8EB] px-3 text-[16px] font-medium outline-none focus:border-[#03ba8c]"
        inputMode="decimal"
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value
          onChange(nextValue === '' ? '' : Number(nextValue))
        }}
      />
    </Label>
  )
}
