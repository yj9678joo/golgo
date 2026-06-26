import test from 'node:test'
import assert from 'node:assert/strict'
import { lockBodyScroll } from './scroll-lock.ts'

test('body 스크롤을 잠그고 cleanup 시 기존 overflow 값을 복원한다', () => {
  const documentLike = {
    body: {
      style: {
        overflow: 'auto',
      },
    },
  }

  const unlock = lockBodyScroll(documentLike)

  assert.equal(documentLike.body.style.overflow, 'hidden')

  unlock()

  assert.equal(documentLike.body.style.overflow, 'auto')
})
