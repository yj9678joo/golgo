import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from './auth-token-storage'

export type ApiResponse<T> = {
  success: boolean
  data: T
  timestamp: string
}

type RefreshResponse = {
  accessToken: string
  expiresIn: number
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8099/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequestConfig | undefined
    const refreshToken = getRefreshToken()

    if (error.response?.status !== 401 || !request || request._retry || !refreshToken) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const response = await axios.post<ApiResponse<RefreshResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
      )

      setAccessToken(response.data.data.accessToken)
      request.headers.Authorization = `Bearer ${response.data.data.accessToken}`

      return api(request)
    } catch (refreshError) {
      clearAuthTokens()
      return Promise.reject(refreshError)
    }
  },
)

export function getOAuthLoginUrl(provider: 'google' | 'naver' | 'kakao') {
  return `${API_BASE_URL}/auth/${provider}/login`
}
