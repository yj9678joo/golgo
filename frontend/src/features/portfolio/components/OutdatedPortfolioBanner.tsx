import { Upload, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type OutdatedPortfolioBannerProps = {
  message?: string | null
}

export function OutdatedPortfolioBanner({ message }: OutdatedPortfolioBannerProps) {
  const navigate = useNavigate()

  return (
    <Card className="rounded-[18px] border-0 bg-[#FFF4E5] p-4 text-[#8A4B00] shadow-none">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold">포트폴리오 최신화가 필요해요</h2>
          <p className="mt-1 text-[13px] leading-5">
            {message ?? '최근 보유 종목 정보가 오래되었습니다. MTS 캡처를 다시 업로드해주세요.'}
          </p>
        </div>
      </div>
      <Button
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#03ba8c] px-4 text-[14px] font-semibold text-white"
        type="button"
        onClick={() => navigate('/portfolio/screenshot')}
      >
        <Upload className="size-4" aria-hidden="true" />
        캡처로 최신화
      </Button>
    </Card>
  )
}
