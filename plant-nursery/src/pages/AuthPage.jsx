import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeading from '../components/PageHeading'
import AsyncState from '../components/AsyncState'
import PlantArt from '../components/PlantArt'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'

export default function AuthPage({ t, language, onAuthenticated, onNavigate }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const mutation = useMutation()

  async function submit(event) {
    event.preventDefault()
    const result = await mutation.run(() =>
      api('/auth/' + mode + '/', {
        method: 'POST',
        body: {
          username,
          password,
          ...(mode === 'register' && {
            nickname,
            password_confirm: passwordConfirm,
          }),
        },
      }),
    )
    if (result.ok) {
      setPassword('')
      setPasswordConfirm('')
      onAuthenticated(result.data)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR LITTLE GREEN WORLD"
        title={t('让每一盆植物，都被好好照顾', 'A little care for every plant')}
        description={t(
          '登录后管理自己的植物，或照顾明确授权给你的植物。',
          'Sign in to manage your plants and those explicitly shared with you.',
        )}
      />
      <div className="auth-grid">
        <section className="panel">
          <div className="filter-tabs">
            {[
              ['login', '登录', 'Sign in'],
              ['register', '注册', 'Register'],
            ].map(([id, zh, en]) => (
              <button
                key={id}
                disabled={mutation.pending}
                className={mode === id ? 'selected' : ''}
                onClick={() => setMode(id)}
              >
                {t(zh, en)}
              </button>
            ))}
          </div>
          <form className="stack-form" onSubmit={submit}>
            <label>
              {t('用户名', 'Username')}
              <input
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                pattern={mode === 'register' ? '[A-Za-z0-9_]{3,30}' : undefined}
                maxLength="30"
              />
            </label>
            {mode === 'register' && (
              <>
                <small className="muted">
                  {t(
                    '3–30 个英文字母、数字或下划线，不区分大小写。',
                    '3–30 letters, numbers or underscores. Case insensitive.',
                  )}
                </small>
                <label>
                  {t('昵称', 'Nickname')}
                  <input
                    required
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    maxLength="30"
                    autoComplete="nickname"
                  />
                </label>
              </>
            )}
            <label>
              {t('密码', 'Password')}
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={mode === 'register' ? 8 : undefined}
                maxLength="128"
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
              />
            </label>
            {mode === 'register' && (
              <label>
                {t('确认密码', 'Confirm password')}
                <input
                  type="password"
                  required
                  minLength="8"
                  maxLength="128"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                />
              </label>
            )}
            {mode === 'register' &&
              passwordConfirm &&
              password !== passwordConfirm && (
                <p className="form-error" role="alert">
                  {t('两次密码不一致。', 'Passwords do not match.')}
                </p>
              )}
            {mode === 'register' && (
              <p className="small-print">
                {t(
                  '至少 8 位，避免常见密码、纯数字或与用户名过于相似。新账户从空花园开始。',
                  'At least 8 characters. Avoid common, numeric or username-like passwords. New accounts start with an empty garden.',
                )}
              </p>
            )}
            <AsyncState error={mutation.error} t={t} language={language} />
            <button
              className="button primary"
              disabled={
                mutation.pending ||
                (mode === 'register' && password !== passwordConfirm)
              }
            >
              {mutation.pending
                ? t('正在提交…', 'Submitting…')
                : mode === 'register'
                  ? t('创建账户', 'Create account')
                  : t('登录', 'Sign in')}
            </button>
          </form>
        </section>
        <section className="auth-welcome">
          <PlantArt type="split" />
          <h2>
            {t('一个花园，属于真实的你。', 'A garden that is truly yours.')}
          </h2>
          <p>
            {t(
              '每一盆都有独立记录。只与获得授权的朋友分享。',
              'Every pot has its own history. Share access only with people you choose.',
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => onNavigate('guides')}
          >
            <Icon name="book" />
            {t('先浏览养护指南', 'Explore care guides')}
          </button>
        </section>
      </div>
    </>
  )
}
