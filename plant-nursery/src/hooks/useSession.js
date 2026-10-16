import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    api('/auth/me/')
      .then((profile) => {
        if (active) {
          setUser(profile)
          setError(null)
          setLoading(false)
        }
      })
      .catch((failure) => {
        if (!active) return
        setUser(null)
        setError(failure.code === 'not_authenticated' ? null : failure)
        setLoading(false)
      })
    const expire = () => {
      setUser(null)
      setError(null)
    }
    window.addEventListener('plantpal:session-expired', expire)
    return () => {
      active = false
      window.removeEventListener('plantpal:session-expired', expire)
    }
  }, [revision])
  return {
    user,
    setUser,
    loading,
    error,
    retry: () => {
      setLoading(true)
      setRevision((value) => value + 1)
    },
  }
}
