import { api, type ApiResponse } from '@/lib/api/client'
import type { AuthUser, NicknameUpdateResponse } from '@/features/auth/types'

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

export async function logout(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken })
}
