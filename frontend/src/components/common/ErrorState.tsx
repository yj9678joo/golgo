import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type ErrorStateProps = {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="rounded-[18px] border-0 bg-white p-5 text-center shadow-none">
      <AlertCircle className="mx-auto size-7 text-[#E5484D]" aria-hidden="true" />
      <p className="mt-3 text-[14px] font-semibold text-[#191F28]">{message}</p>
      <Button
        className="mt-4 h-11 rounded-[14px] bg-[#191F28] px-5 text-[14px] font-semibold text-white"
        type="button"
        onClick={onRetry}
      >
        다시 불러오기
      </Button>
    </Card>
  )
}
