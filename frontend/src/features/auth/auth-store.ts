import { create } from 'zustand'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  type AuthTokens,
} from '@/lib/auth-storage'
import { fetchMe, logout } from './auth-api'
import type { AuthUser } from './types'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  hasTokens: boolean
  setTokens: (tokens: AuthTokens) => void
  loadUser: () => Promise<AuthUser | null>
  signOut: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: getAccessToken() ? 'idle' : 'anonymous',
  error: null,
  hasTokens: Boolean(getAccessToken() && getRefreshToken()),
  setTokens: (tokens) => {
    setAuthTokens(tokens)
    set({ hasTokens: true, status: 'idle', error: null })
  },
  loadUser: async () => {
    if (!getAccessToken()) {
      set({ user: null, status: 'anonymous', hasTokens: false })
      return null
    }

    set({ status: 'loading', error: null })

    try {
      const user = await fetchMe()
      set({ user, status: 'authenticated', hasTokens: true })
      return user
    } catch {
      clearAuthTokens()
      set({
        user: null,
        status: 'anonymous',
        hasTokens: false,
        error: '로그인 정보를 확인할 수 없습니다.',
      })
      return null
    }
  },
  signOut: async () => {
    const refreshToken = getRefreshToken()

    if (refreshToken) {
      await logout(refreshToken).catch(() => undefined)
    }

    get().clearSession()
  },
  clearSession: () => {
    clearAuthTokens()
    set({ user: null, status: 'anonymous', hasTokens: false })
  },
}))
