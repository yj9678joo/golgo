import { CheckCircle2, Loader2, ScanLine } from 'lucide-react'

type ParsingProgressProps = {
  isUploading: boolean
}

export function ParsingProgress({ isUploading }: ParsingProgressProps) {
  return (
    <div className="rounded-[18px] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E9FBF6] text-[#03ba8c]">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <ScanLine className="size-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#191F28]">
            {isUploading ? '캡처를 분석 중이에요' : '캡처 파일 준비 완료'}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#6B7684]">
            {isUploading ? '캡처에서 보유 종목 후보를 인식합니다' : '업로드하면 검토 화면으로 이동합니다'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StepLabel done label="업로드" />
        <StepLabel done={!isUploading} label="분석" />
        <StepLabel done={false} label="검토" />
      </div>
    </div>
  )
}

function StepLabel({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className={
        done
          ? 'flex h-9 items-center justify-center gap-1.5 rounded-[12px] bg-[#E9FBF6] text-[12px] font-semibold text-[#03ba8c]'
          : 'flex h-9 items-center justify-center rounded-[12px] bg-[#F2F4F6] text-[12px] font-semibold text-[#8B95A1]'
      }
    >
      {done ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
      {label}
    </div>
  )
}
