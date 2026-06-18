import assert from 'node:assert/strict'
import test from 'node:test'
import { getPostLoginPath } from './get-post-login-path.ts'

test('온보딩 완료 사용자는 대시보드로 이동한다', () => {
  assert.equal(getPostLoginPath(true, '/onboarding'), '/')
})

test('온보딩 미완료 사용자는 로그인 흐름의 설정 화면으로 이동한다', () => {
  assert.equal(getPostLoginPath(false, '/onboarding'), '/onboarding')
  assert.equal(getPostLoginPath(false, '/nickname'), '/nickname')
})
