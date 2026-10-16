import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import AsyncState from '../components/AsyncState'
import Pagination from '../components/Pagination'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'
import { formatTime } from '../data/formatters'

export default function NotificationsPage({
  t,
  language,
  onPlant,
  onNavigate,
  refresh,
}) {
  const [page, setPage] = useState(1)
  const resource = useApiResource('/notifications/?page=' + page, {
    poll: 15000,
  })
  const mutation = useMutation()
  const labels = {
    friend_request: t(
      '你收到一条好友申请，请到“我的好友”处理。',
      'You have a friend request. Respond in My friends.',
    ),
    friend_accepted: t(
      '你的好友申请已被接受。',
      'Your friend request was accepted.',
    ),
    access_granted: t(
      '一盆植物已授权给你代管。',
      'A plant has been shared with you for care.',
    ),
    access_revoked: t(
      '一盆植物的代管授权已被撤销。',
      'Care access to a plant was revoked.',
    ),
  }
  async function markRead(id) {
    const result = await mutation.run(() =>
      api('/notifications/' + id + '/', {
        method: 'PATCH',
        body: { is_read: true },
      }),
    )
    if (result.ok) {
      resource.reload()
      refresh()
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="A NOTE FOR YOU"
        title={t('站内提醒', 'Inbox')}
        description={t(
          '好友申请、代管授权和养护提醒集中在这里。仅在打开网页时获取。',
          'Friend requests, care grants and care reminders in one place. Updated while this page is open.',
        )}
      />
      <AsyncState
        {...resource}
        onRetry={resource.reload}
        t={t}
        language={language}
      />
      <AsyncState error={mutation.error} t={t} language={language} />
      {resource.data && (
        <>
          {resource.data.results.map((item) => (
            <article className="panel notification-card" key={item.id}>
              <div className="section-heading">
                <strong>
                  {item.sender
                    ? item.sender.nickname + ' (@' + item.sender.username + ')'
                    : 'Plant Pal'}
                </strong>
                <span className="tag">
                  {item.is_read ? t('已读', 'Read') : t('未读', 'Unread')}
                </span>
              </div>
              <p>{labels[item.kind] || item.message}</p>
              <time className="small-print" dateTime={item.created_at}>
                {formatTime(item.created_at, language)}
              </time>
              <div className="row-actions">
                {!item.is_read && (
                  <button
                    className="button secondary"
                    disabled={mutation.pending}
                    onClick={() => markRead(item.id)}
                  >
                    {t('标为已读', 'Mark as read')}
                  </button>
                )}
                {item.plant && (
                  <button
                    className="text-button"
                    onClick={() => onPlant({ id: item.plant })}
                  >
                    {t(
                      '查看植物（需仍有权限）',
                      'View plant (access required)',
                    )}
                  </button>
                )}
                {item.kind === 'friend_request' && (
                  <button
                    className="text-button"
                    onClick={() => onNavigate('friends')}
                  >
                    {t('处理好友申请', 'Respond to request')}
                  </button>
                )}
              </div>
            </article>
          ))}
          {!resource.data.count && (
            <p className="empty-state">
              {t('暂时没有站内提醒。', 'Your inbox is empty.')}
            </p>
          )}
          <Pagination
            data={resource.data}
            page={page}
            onChange={setPage}
            t={t}
          />
        </>
      )}
    </>
  )
}
