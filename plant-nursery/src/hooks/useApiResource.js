import { useEffect, useState } from 'react'
import { api, apiList } from '../services/api'

export default function useApiResource(path, { all = false, poll = 0 } = {}) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState({
    path: null,
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    let active = true
    let running = false
    async function load() {
      if (running) return
      running = true
      try {
        const data = await (all ? apiList : api)(path, {
          signal: controller.signal,
        })
        if (active) setResult({ path, data, error: null, loading: false })
      } catch (error) {
        // 权限失效后清空旧数据，不把缓存当作仍有授权。
        if (active) setResult({ path, data: null, error, loading: false })
      } finally {
        running = false
      }
    }
    load()
    const timer = poll ? window.setInterval(load, poll) : null
    window.addEventListener('focus', load)
    return () => {
      active = false
      controller.abort()
      if (timer) window.clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [path, revision, all, poll])

  function reload() {
    setResult({ path, data: null, error: null, loading: true })
    setRevision((value) => value + 1)
  }

  const current =
    result.path === path && path
      ? result
      : { data: null, error: null, loading: Boolean(path) }
  return { ...current, reload }
}
