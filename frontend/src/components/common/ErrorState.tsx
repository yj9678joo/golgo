import { AlertCircle } from 'lucide-react'

type ErrorStateProps = {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-[18px] bg-white p-5 text-center">
      <AlertCircle className="mx-auto size-7 text-[#E5484D]" aria-hidden="true" />
      <p className="mt-3 text-[14px] font-semibold text-[#191F28]">{message}</p>
      <button
        className="mt-4 h-11 rounded-[14px] bg-[#191F28] px-5 text-[14px] font-semibold text-white"
        type="button"
        onClick={onRetry}
      >
        다시 불러오기
      </button>
    </section>
  )
}
