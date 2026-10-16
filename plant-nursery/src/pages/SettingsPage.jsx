import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import AsyncState from '../components/AsyncState'
import Icon from '../components/Icon'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'

export default function SettingsPage({
  t,
  language,
  user,
  onProfile,
  onLoggedOut,
}) {
  const [nickname, setNickname] = useState(user.nickname)
  const [email, setEmail] = useState(user.email)
  const [feedback, setFeedback] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const profileAction = useMutation()
  const feedbackAction = useMutation()
  async function saveProfile(event) {
    event.preventDefault()
    const result = await profileAction.run(() =>
      api('/auth/me/', {
        method: 'PATCH',
        body: { nickname: nickname.trim(), email: email.trim() },
      }),
    )
    if (result.ok) {
      onProfile(result.data)
      setProfileMessage(t('个人资料已保存。', 'Profile saved.'))
    }
  }
  async function logout() {
    const result = await profileAction.run(() =>
      api('/auth/logout/', { method: 'POST' }),
    )
    if (result.ok) onLoggedOut()
  }
  async function submitFeedback(event) {
    event.preventDefault()
    const result = await feedbackAction.run(() =>
      api('/feedback/', { method: 'POST', body: { message: feedback.trim() } }),
    )
    if (result.ok) {
      setFeedback('')
      setFeedbackMessage(
        t(
          '反馈已保存，管理员可以在后台查看。',
          'Feedback saved. The administrator can read it in Django Admin.',
        ),
      )
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title={t('设置', 'Settings')}
        description={t(
          '管理个人资料，或给 Plant Pal 留个建议。',
          'Manage your profile or leave Plant Pal a note.',
        )}
        action={
          <button
            className="button secondary"
            onClick={logout}
            disabled={profileAction.pending}
          >
            {t('退出登录', 'Sign out')}
          </button>
        }
      />
      <div className="settings-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>{t('账户信息', 'Profile information')}</h2>
            <span className="tag">@{user.username}</span>
          </div>
          <form className="stack-form" onSubmit={saveProfile}>
            <label>
              {t('昵称', 'Nickname')}
              <input
                required
                maxLength="30"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="nickname"
              />
            </label>
            <label>
              {t('电子邮箱（可选）', 'Email (optional)')}
              <input
                type="email"
                maxLength="254"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <AsyncState error={profileAction.error} t={t} language={language} />
            <button
              className="button primary"
              disabled={profileAction.pending || !nickname.trim()}
            >
              {profileAction.pending
                ? t('正在提交…', 'Submitting…')
                : t('保存信息', 'Save profile')}
            </button>
          </form>
          {profileMessage && (
            <p className="notice" role="status">
              {profileMessage}
            </p>
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>{t('联系我们', 'Contact us')}</h2>
            <Icon name="mail" />
          </div>
          <p className="muted">
            {t(
              '建议保存到本站后台，不发送邮件或短信。',
              'Suggestions are saved for the administrator. No email or SMS is sent.',
            )}
          </p>
          <form className="stack-form" onSubmit={submitFeedback}>
            <label>
              {t('你的建议', 'Your suggestion')}
              <textarea
                rows="6"
                required
                maxLength="2000"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
            </label>
            <AsyncState
              error={feedbackAction.error}
              t={t}
              language={language}
            />
            <button
              className="button secondary"
              disabled={feedbackAction.pending || !feedback.trim()}
            >
              {feedbackAction.pending
                ? t('正在提交…', 'Submitting…')
                : t('提交建议', 'Submit suggestion')}
            </button>
          </form>
          {feedbackMessage && (
            <p className="notice" role="status">
              {feedbackMessage}
            </p>
          )}
        </section>
      </div>
      <section className="panel about-panel">
        <span className="brand-symbol">
          <Icon name="leaf" size={26} />
        </span>
        <div>
          <h3>Plant Pal</h3>
          <p className="muted">
            {t(
              '植物、记录和授权保存到数据库。切换账号不会共享个人数据。',
              'Plants, care records and access grants are stored in the database. Accounts keep separate data.',
            )}
          </p>
          <p className="small-print">
            {t(
              '语言偏好保存在浏览器；图片仅本地预览。植物识别待接入，提醒仅在网页内显示。',
              'Language preferences stay in the browser; images are previewed locally. Identification is not connected. Reminders are in-page only.',
            )}
          </p>
        </div>
      </section>
    </>
  )
}
