import { FormEvent, useState } from 'react'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobilePage } from '@/components/layout/MobilePage'
import logo from '@/assets/golgo-logo.png'
import { useAuthStore } from '@/features/auth/store/auth-store'

const nicknamePattern = /^[가-힣A-Za-z0-9]{2,12}$/
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nicknameSuggestions = ['투자초보', '오늘도매수', '복리의힘']

type RegisterErrors = Partial<{
  loginId: string
  password: string
  name: string
  email: string
  nickname: string
  submit: string
}>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerWithPassword = useAuthStore((state) => state.registerWithPassword)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPasswordValid = passwordPattern.test(password)
  const isNicknameValid = nicknamePattern.test(nickname)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await registerWithPassword({ loginId, password, name, email, nickname })
      navigate('/onboarding', { replace: true })
    } catch {
      setErrors({ submit: '회원가입에 실패했습니다. 입력값 중복 여부를 확인해 주세요.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function validateForm() {
    const nextErrors: RegisterErrors = {}

    if (!loginId.trim()) {
      nextErrors.loginId = '아이디를 입력해 주세요.'
    }
    if (!isPasswordValid) {
      nextErrors.password = '비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.'
    }
    if (!name.trim()) {
      nextErrors.name = '이름을 입력해 주세요.'
    }
    if (!emailPattern.test(email)) {
      nextErrors.email = '이메일 형식을 확인해 주세요.'
    }
    if (!isNicknameValid) {
      nextErrors.nickname = '닉네임은 한글, 영문, 숫자 2~12자로 입력해 주세요.'
    }

    return nextErrors
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[390px] flex-col rounded-[24px] bg-[#F7F8FA] px-4 py-4 sm:min-h-[720px] sm:rounded-[32px] sm:border sm:border-white/80 sm:px-7 sm:py-8 sm:shadow-[0_24px_80px_rgba(25,31,40,0.14)]">
        <div className="hidden justify-center sm:flex">
          <div className="h-1.5 w-20 rounded-full bg-[#DDE2E7]" />
        </div>

        <header className="flex items-center justify-between pt-1 sm:pt-4">
          <button
            className="inline-flex size-11 items-center justify-center rounded-[12px] border border-[#E5E8EB] bg-white text-[#4E5968] transition hover:bg-[#F2F4F6]"
            type="button"
            onClick={() => navigate('/login')}
            aria-label="로그인으로 돌아가기"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <BrandLogo />
        </header>

        <div className="mt-7">
          <h1 className="text-[26px] font-semibold leading-[1.22] text-[#191F28]">
            계정을 만들고
            <br />
            바로 시작하세요
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">
            로그인에 사용할 정보와 표시 이름을 입력해 주세요
          </p>
        </div>

        <form className="mt-6 flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="grid gap-3 rounded-[18px] border border-[#E5E8EB] bg-white p-4 shadow-sm">
            <TextField
              autoComplete="username"
              error={errors.loginId}
              label="아이디"
              name="loginId"
              onChange={setLoginId}
              value={loginId}
            />
            <TextField
              autoComplete="new-password"
              error={errors.password}
              label="비밀번호"
              name="password"
              onChange={setPassword}
              type="password"
              value={password}
            />
            <ValidationHint active={password.length > 0} valid={isPasswordValid}>
              대문자·특수문자 포함 8자 이상
            </ValidationHint>
            <TextField
              autoComplete="name"
              error={errors.name}
              label="이름"
              name="name"
              onChange={setName}
              value={name}
            />
            <TextField
              autoComplete="email"
              error={errors.email}
              label="이메일"
              name="email"
              onChange={setEmail}
              type="email"
              value={email}
            />
            <div className="grid gap-1.5">
              <label className="text-[12px] font-medium text-[#4E5968]" htmlFor="nickname">
                닉네임
              </label>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-[14px] border border-[#DDE2E7] bg-[#F7F8FA] px-3 pr-14 text-[15px] font-semibold text-[#191F28] outline-none transition focus:border-[#00A37A] focus:bg-white"
                  id="nickname"
                  maxLength={12}
                  name="nickname"
                  onChange={(event) => setNickname(event.target.value.trim())}
                  pattern="[가-힣A-Za-z0-9]{2,12}"
                  placeholder="투자초보"
                  value={nickname}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8B95A1]">
                  {nickname.length}/12
                </span>
              </div>
              {errors.nickname ? (
                <p className="text-[12px] leading-5 text-red-600">{errors.nickname}</p>
              ) : null}
              <ValidationHint active={nickname.length > 0} valid={isNicknameValid}>
                한글·영문·숫자 2~12자
              </ValidationHint>
            </div>

            <div className="grid gap-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-normal text-[#8B95A1]">
                추천 닉네임
              </p>
              <div className="flex flex-wrap gap-1.5">
                {nicknameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="h-9 rounded-full border border-[#E5E8EB] bg-white px-3.5 text-[13px] font-medium text-[#4E5968] transition hover:border-[#00A37A] hover:text-[#00A37A]"
                    type="button"
                    onClick={() => setNickname(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errors.submit ? (
            <p className="mt-3 text-[13px] leading-5 text-red-600">{errors.submit}</p>
          ) : null}

          <div className="flex-1" />

          <button
            className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#00A37A] px-4 text-[15px] font-semibold text-white transition hover:bg-[#008F6C] disabled:cursor-not-allowed disabled:opacity-45"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              '회원가입'
            )}
          </button>
        </form>
      </div>
    </MobilePage>
  )
}

type TextFieldProps = {
  autoComplete: string
  error?: string
  label: string
  name: string
  onChange: (value: string) => void
  type?: 'email' | 'password' | 'text'
  value: string
}

function TextField({
  autoComplete,
  error,
  label,
  name,
  onChange,
  type = 'text',
  value,
}: TextFieldProps) {
  return (
    <label className="grid gap-1.5 text-[12px] font-medium text-[#4E5968]">
      {label}
      <input
        autoComplete={autoComplete}
        className="h-12 rounded-[14px] border border-[#DDE2E7] bg-[#F7F8FA] px-3 text-[15px] text-[#191F28] outline-none transition focus:border-[#00A37A] focus:bg-white"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? <span className="text-[12px] leading-5 text-red-600">{error}</span> : null}
    </label>
  )
}

type ValidationHintProps = {
  active: boolean
  children: string
  valid: boolean
}

function ValidationHint({ active, children, valid }: ValidationHintProps) {
  const tone = active && !valid ? 'text-red-600' : 'text-[#8B95A1]'

  return (
    <p className={`flex items-center gap-1.5 text-[12px] leading-5 ${tone}`}>
      <Check className="size-3.5 text-[#00A37A]" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <img className="size-8" src={logo} alt="" />
      <span className="text-[20px] font-semibold tracking-normal text-[#191F28]">고르고</span>
    </div>
  )
}
