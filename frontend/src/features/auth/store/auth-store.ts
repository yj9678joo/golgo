import { create } from 'zustand'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  type AuthTokens,
} from '@/lib/api/auth-token-storage'
import { fetchMe, login, logout, register } from '@/features/auth/api/auth-api'
import type { AuthUser, RegisterPayload } from '@/features/auth/types'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  hasTokens: boolean
  setTokens: (tokens: AuthTokens) => void
  loadUser: () => Promise<AuthUser | null>
  loginWithPassword: (loginId: string, password: string) => Promise<AuthUser>
  registerWithPassword: (payload: RegisterPayload) => Promise<AuthUser>
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
  loginWithPassword: async (loginId, password) => {
    set({ status: 'loading', error: null })

    try {
      const tokens = await login(loginId, password)
      get().setTokens(tokens)

      const user = await get().loadUser()

      if (!user) {
        throw new Error('로그인 사용자 정보를 확인할 수 없습니다.')
      }

      return user
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '아이디 또는 비밀번호가 올바르지 않습니다.'

      set({ status: getAccessToken() ? 'idle' : 'anonymous', error: message })
      throw error
    }
  },
  registerWithPassword: async (payload) => {
    set({ status: 'loading', error: null })

    try {
      const tokens = await register(payload)
      get().setTokens(tokens)

      const user = await get().loadUser()

      if (!user) {
        throw new Error('회원가입 사용자 정보를 확인할 수 없습니다.')
      }

      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.'

      set({ status: getAccessToken() ? 'idle' : 'anonymous', error: message })
      throw error
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
