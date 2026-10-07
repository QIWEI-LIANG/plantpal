import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import Icon from '../components/Icon'

export default function SettingsPage({ t, state, onUpdate, notify }) {
  const [nickname, setNickname] = useState(state.profile.nickname)
  const [email, setEmail] = useState(state.profile.email)
  const [message, setMessage] = useState('')
  function saveProfile(event) {
    event.preventDefault()
    if (!nickname.trim()) {
      notify(t('昵称不能只有空格。', 'Your nickname cannot be blank.'))
      return
    }
    onUpdate((previous) => ({
      ...previous,
      profile: { nickname: nickname.trim(), email: email.trim() },
    }))
    notify(
      t(
        '账户展示信息已保存到本机，没有创建真实账户。',
        'Display profile saved locally. No real account was created.',
      ),
    )
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title={t('设置', 'Settings')}
        description={t(
          '管理你的展示信息，或给 Plant Pal 留个建议。',
          'Manage your display profile, or leave Plant Pal a note.',
        )}
      />
      <div className="settings-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>{t('账户信息', 'Profile information')}</h2>
            <span className="tag">
              {t('本地示例账户', 'Local example profile')}
            </span>
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
              {t('电子邮箱（展示用）', 'Email (display only)')}
              <input
                type="email"
                required
                maxLength="100"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <p className="small-print">
              {t(
                '无需登录。信息仅用于页面展示和养护记录。',
                'No login needed. Details are used for display and care history only.',
              )}
            </p>
            <button className="button primary" type="submit">
              {t('保存信息', 'Save profile')}
            </button>
          </form>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>{t('联系我们', 'Contact us')}</h2>
            <Icon name="mail" />
          </div>
          <p className="muted">
            {t(
              '这是课堂原型的反馈入口，提交不会发送邮件。',
              'A classroom feedback demonstration. Submitting sends no email.',
            )}
          </p>
          <form
            className="stack-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (!message.trim()) {
                notify(
                  t('请先写一点建议。', 'Please write a suggestion first.'),
                )
                return
              }
              notify(
                t(
                  '谢谢！已展示模拟提交反馈，你的内容没有发送到服务器。',
                  'Thanks! Demo submission complete. Your message was not sent to a server.',
                ),
              )
              setMessage('')
            }}
          >
            <label>
              {t('你的建议', 'Your suggestion')}
              <textarea
                rows="6"
                required
                maxLength="1000"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t(
                  '有什么能让养护更轻松？',
                  'What could make plant care easier?',
                )}
              />
            </label>
            <button className="button secondary" type="submit">
              {t('提交建议（模拟）', 'Submit suggestion (demo)')}
              <Icon name="arrow" size={16} />
            </button>
          </form>
        </section>
      </div>
      <section className="panel about-panel">
        <span className="brand-symbol">
          <Icon name="leaf" size={26} />
        </span>
        <div>
          <h3>Plant Pal · v1</h3>
          <p className="muted">
            {t(
              'CSI405 Interactive Systems · CW2 前端原型。用检查、记录和交接，让植物养护更有把握。',
              'CSI405 Interactive Systems · CW2 frontend prototype. Check, record, and hand over care with confidence.',
            )}
          </p>
          <p className="small-print">
            {t(
              '偏好设置、植物、记录、说明、好友和点赞保存于 localStorage；清除浏览器站点数据将恢复示例。图片不保存。',
              'Preferences, plants, history, instructions, friends, and likes use localStorage. Clearing site data restores examples. Images are not saved.',
            )}
          </p>
        </div>
      </section>
    </>
  )
}
