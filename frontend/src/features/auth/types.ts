export type SocialProvider = 'GOOGLE' | 'NAVER' | 'KAKAO'

export type AuthUser = {
  userId: string
  email: string
  nickname: string
  profileImage: string | null
  connectedProviders: SocialProvider[]
  createdAt: string
}

export type NicknameUpdateResponse = {
  nickname: string
  updatedAt: string
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
