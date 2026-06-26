type ScrollLockDocument = {
  body: {
    style: {
      overflow: string
    }
  }
}

export function lockBodyScroll(documentLike: ScrollLockDocument = document) {
  const previousOverflow = documentLike.body.style.overflow
  documentLike.body.style.overflow = 'hidden'

  return () => {
    documentLike.body.style.overflow = previousOverflow
  }
}
