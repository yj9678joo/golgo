import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  )
}
