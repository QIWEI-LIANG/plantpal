export class ApiError extends Error {
  constructor(status, error) {
    super(error.message?.en || 'Request failed')
    this.status = status
    this.code = error.code
    this.messages = error.message
    this.fields = error.fields
  }
}

function csrfCookie() {
  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith('csrftoken='))
  return value ? decodeURIComponent(value.slice('csrftoken='.length)) : ''
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  // 所有业务请求走 Vite 的同源 /api；Session cookie 交给浏览器管理。
  if (!['GET', 'HEAD'].includes(method) && !csrfCookie()) {
    await api('/auth/csrf/', { signal })
  }
  const controller = new AbortController()
  const cancel = () => controller.abort()
  signal?.addEventListener('abort', cancel)
  if (signal?.aborted) controller.abort()
  const timer = window.setTimeout(cancel, 15000)
  try {
    const response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(!['GET', 'HEAD'].includes(method) && {
          'X-CSRFToken': csrfCookie(),
        }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
    const data =
      response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
      const error = new ApiError(
        response.status,
        data?.error || {
          code: 'server_error',
          message: {
            zh: '服务器暂时不可用，请确认 Django 已启动后重试。',
            en: 'Server unavailable. Check that Django is running and retry.',
          },
        },
      )
      if (error.code === 'not_authenticated')
        window.dispatchEvent(new Event('plantpal:session-expired'))
      throw error
    }
    return data
  } catch (error) {
    if (error instanceof ApiError || signal?.aborted) throw error
    throw new ApiError(0, {
      code: 'network_error',
      message: {
        zh: '请求超时或网络不可用，请检查后端并重试。',
        en: 'Request timed out or network unavailable. Check the backend and retry.',
      },
    })
  } finally {
    window.clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}

export async function apiList(path, options) {
  const items = []
  let next = path
  while (next) {
    const page = await api(next, options)
    items.push(...page.results)
    if (!page.next) break
    const url = new URL(page.next, window.location.origin)
    next = url.pathname.replace(/^\/api/, '') + url.search
  }
  return items
}

export function errorMessage(error, language) {
  if (!error) return ''
  const message = error.messages?.[language] || error.message
  if (error.code !== 'invalid' || !error.fields) return message
  const details = Object.values(error.fields)
    .flat()
    .filter((value) => typeof value === 'string')
    .join(' ')
  return details ? message + ' ' + details : message
}
