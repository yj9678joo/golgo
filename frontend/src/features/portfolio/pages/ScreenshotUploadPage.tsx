import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, ImageUp, Plus } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { ParsingProgress } from '@/features/portfolio/components/ParsingProgress'
import {
  useCreateScreenshotAccount,
  useScreenshotAccounts,
  useUploadPortfolioScreenshot,
} from '@/features/portfolio/hooks/use-screenshot-upload'

export function ScreenshotUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const accountsQuery = useScreenshotAccounts()
  const createAccount = useCreateScreenshotAccount()
  const uploadScreenshot = useUploadPortfolioScreenshot()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const screenshotAccount = useMemo(
    () => accountsQuery.data?.find((account) => account.connectionType === 'SCREENSHOT'),
    [accountsQuery.data],
  )

  const submit = async () => {
    if (!selectedFile) {
      setError('업로드할 MTS 캡처를 선택해주세요.')
      return
    }

    setError(null)

    try {
      const account = screenshotAccount ?? (await createAccount.mutateAsync())
      const result = await uploadScreenshot.mutateAsync({
        accountId: account.accountId,
        image: selectedFile,
      })

      navigate(`/portfolio/screenshot/${result.jobId}`)
    } catch {
      setError('캡처 업로드에 실패했어요. 이미지 파일을 확인해주세요.')
    }
  }

  const isWorking = createAccount.isPending || uploadScreenshot.isPending

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
        <button
          className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-white text-[#4E5968]"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>

        <header>
          <p className="text-[13px] font-semibold text-[#03ba8c]">MTS 캡처 연동</p>
          <h1 className="mt-2 text-[27px] font-semibold leading-[1.25] text-[#191F28]">
            보유 종목 화면을
            <br />
            업로드해주세요
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">
            Week 5에서는 캡처 파일 저장과 임시 파싱 결과 검토까지 지원합니다.
          </p>
        </header>

        <button
          className="mt-6 flex min-h-[210px] w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-[#B0B8C1] bg-white px-5 text-center"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex size-16 items-center justify-center rounded-[20px] bg-[#E9FBF6] text-[#03ba8c]">
            {selectedFile ? (
              <Camera className="size-7" aria-hidden="true" />
            ) : (
              <ImageUp className="size-7" aria-hidden="true" />
            )}
          </span>
          <span className="mt-4 text-[16px] font-semibold text-[#191F28]">
            {selectedFile ? selectedFile.name : '캡처 이미지 선택'}
          </span>
          <span className="mt-2 text-[12px] leading-5 text-[#6B7684]">
            PNG, JPG 파일을 최대 10MB까지 업로드할 수 있어요.
          </span>
        </button>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />

        <div className="mt-4">
          <ParsingProgress isUploading={isWorking} />
        </div>

        {error ? (
          <p className="mt-4 rounded-[14px] bg-white p-3 text-center text-[13px] font-semibold text-[#E5484D]">
            {error}
          </p>
        ) : null}

        <div className="flex-1" />

        <button
          className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white disabled:bg-[#B0B8C1]"
          type="button"
          onClick={() => void submit()}
          disabled={isWorking}
        >
          <Plus className="size-4" aria-hidden="true" />
          {isWorking ? '분석 중...' : '업로드하고 검토하기'}
        </button>
      </div>
    </MobilePage>
  )
}
