import { useEffect, useState } from 'react'
import type { Holding } from '@/features/portfolio/types'

type HoldingEditSheetProps = {
  holding: Holding | null
  onClose: () => void
  onSave: (holding: Holding) => void
}

export function HoldingEditSheet({ holding, onClose, onSave }: HoldingEditSheetProps) {
  const [form, setForm] = useState<Holding | null>(holding)

  useEffect(() => {
    setForm(holding)
  }, [holding])

  if (!holding || !form) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35 px-4 pb-4">
      <div className="mx-auto w-full max-w-[430px] rounded-[22px] bg-white p-5 shadow-xl">
        <header className="mb-4">
          <p className="text-[12px] font-semibold text-[#8B95A1]">보유 종목 수정</p>
          <h2 className="mt-1 text-[20px] font-semibold text-[#191F28]">{holding.name}</h2>
        </header>

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
          <button
            className="h-12 rounded-[14px] bg-[#F2F4F6] text-[14px] font-semibold text-[#4E5968]"
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="h-12 rounded-[14px] bg-[#03ba8c] text-[14px] font-semibold text-white"
            type="button"
            onClick={() =>
              onSave({
                ...form,
                currentValueKrw: Number((form.quantity * form.currentPrice).toFixed(2)),
              })
            }
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
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
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-[#6B7684]">{label}</span>
      <input
        className="h-11 rounded-[12px] border border-[#E5E8EB] px-3 text-[14px] font-medium outline-none focus:border-[#03ba8c]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] font-semibold text-[#6B7684]">{label}</span>
      <input
        className="h-11 rounded-[12px] border border-[#E5E8EB] px-3 text-[14px] font-medium outline-none focus:border-[#03ba8c]"
        inputMode="decimal"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
