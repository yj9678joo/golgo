import { api, type ApiResponse } from '@/lib/api/client'
import type {
  AuthUser,
  NicknameUpdateResponse,
  RegisterPayload,
  TokenPair,
} from '@/features/auth/types'

export async function fetchMe() {
  const response = await api.get<ApiResponse<AuthUser>>('/auth/me')
  return response.data.data
}

export async function updateNickname(nickname: string) {
  const response = await api.patch<ApiResponse<NicknameUpdateResponse>>('/auth/me/nickname', {
    nickname,
  })
  return response.data.data
}

export async function login(loginId: string, password: string) {
  const response = await api.post<ApiResponse<TokenPair>>('/auth/login', {
    loginId,
    password,
  })
  return response.data.data
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<TokenPair>>('/auth/register', payload)
  return response.data.data
}

export async function logout(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken })
}
