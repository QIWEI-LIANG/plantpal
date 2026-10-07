import { useEffect, useRef } from 'react'

export default function Modal({ title, children, onClose, t, className = '' }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    const close = () => closeRef.current()
    dialog.addEventListener('cancel', close)
    return () => {
      dialog.removeEventListener('cancel', close)
      dialog.close()
    }
  }, [])
  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button
          autoFocus
          className="icon-button close-button"
          onClick={onClose}
          aria-label={t('关闭弹窗', 'Close dialog')}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  )
}
