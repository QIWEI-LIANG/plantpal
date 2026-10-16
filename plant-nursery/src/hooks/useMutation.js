import { useRef, useState } from 'react'

export default function useMutation() {
  const running = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  async function run(action) {
    if (running.current) return { ok: false }
    running.current = true
    setPending(true)
    setError(null)
    try {
      const data = await action()
      return { ok: true, data }
    } catch (failure) {
      setError(failure)
      return { ok: false }
    } finally {
      running.current = false
      setPending(false)
    }
  }
  return { run, pending, error }
}
