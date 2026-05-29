export type OnboardingStep = 'persona' | 'broker' | 'done'

export type InvestmentPersona = 'conservative' | 'balanced' | 'growth' | 'custom'

export type BrokerId =
  | 'kis'
  | 'mirae'
  | 'nh'
  | 'samsung'
  | 'kiwoom'
  | 'kb'
  | 'shinhan'
  | 'toss'
  | 'other'

export type BrokerConnectionMethod = 'api-key' | 'screenshot'
