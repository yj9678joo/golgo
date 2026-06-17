type OnboardingStepBarProps = {
  current: number
  total: number
}

export function OnboardingStepBar({ current, total }: OnboardingStepBarProps) {
  return (
    <div className="grid gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const isActive = index < current

          return (
            <div
              key={index}
              className={
                isActive
                  ? 'h-1 flex-1 rounded-full bg-[#03ba8c]'
                  : 'h-1 flex-1 rounded-full bg-[#DDE2E7]'
              }
            />
          )
        })}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-normal text-[#8B95A1]">
        {current} / {total} 단계
      </p>
    </div>
  )
}
