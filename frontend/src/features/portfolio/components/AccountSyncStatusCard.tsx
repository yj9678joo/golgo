import { CheckCircle2, Clock3 } from 'lucide-react'
import type { PortfolioAccount } from '@/features/portfolio/types'

type AccountSyncStatusCardProps = {
  account: PortfolioAccount
}

export function AccountSyncStatusCard({ account }: AccountSyncStatusCardProps) {
  const isSynced = account.syncStatus === 'SYNCED'

  return (
    <article className="rounded-[16px] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold text-[#191F28]">
            {account.accountNickname}
          </h3>
          <p className="mt-1 text-[12px] text-[#6B7684]">
            {account.brokerCode} · {account.connectionType === 'SCREENSHOT' ? '캡처' : 'API Key'}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isSynced ? 'bg-[#E9FBF6] text-[#03ba8c]' : 'bg-[#FFF4E5] text-[#B95E00]'
          }`}
        >
          {isSynced ? (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Clock3 className="size-3.5" aria-hidden="true" />
          )}
          {isSynced ? '정상' : '최신화 필요'}
        </span>
      </div>
      <p className="mt-3 text-[12px] text-[#8B95A1]">
        {account.daysSinceSync === null
          ? '아직 동기화 기록이 없어요'
          : `${account.daysSinceSync}일 전 동기화`}
      </p>
    </article>
  )
}
