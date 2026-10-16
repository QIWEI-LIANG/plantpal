import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import AsyncState from '../components/AsyncState'
import FriendPlants from '../components/FriendPlants'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'

export default function FriendsPage({ t, language, onPlant }) {
  const [query, setQuery] = useState('')
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [message, setMessage] = useState('')
  const friendships = useApiResource('/friendships/', {
    all: true,
    poll: 15000,
  })
  const search = useApiResource(
    query.trim().length >= 2
      ? '/users/?search=' + encodeURIComponent(query.trim())
      : null,
    { all: true },
  )
  const mutation = useMutation()
  const relationships = friendships.data || []
  const friends = relationships.filter((item) => item.status === 'accepted')
  const pending = relationships.filter((item) => item.status === 'pending')

  async function action(path, method, body, success) {
    const result = await mutation.run(() => api(path, { method, body }))
    if (result.ok) {
      friendships.reload()
      setMessage(success)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="GROW TOGETHER"
        title={t('我的好友', 'My friends')}
        description={t(
          '先成为好友，再由主人对每一盆植物明确授权。',
          'Become friends, then ask the owner to share each plant explicitly.',
        )}
      />
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t(
            '按用户名搜索，至少 2 个字符…',
            'Search username, at least 2 characters…',
          )}
        />
        <span className="tag">
          {friends.length} {t('位好友', 'friends')}
        </span>
      </div>
      <AsyncState
        loading={friendships.loading}
        error={friendships.error}
        onRetry={friendships.reload}
        t={t}
        language={language}
      />
      <AsyncState
        loading={search.loading}
        error={search.error}
        onRetry={search.reload}
        t={t}
        language={language}
      />
      <AsyncState error={mutation.error} t={t} language={language} />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {search.data && (
        <section className="panel">
          <h2>{t('搜索结果', 'Search results')}</h2>
          {search.data.length ? (
            search.data.map((user) => {
              const relation = relationships.find(
                (item) => item.user.id === user.id,
              )
              const connected = relation && relation.status !== 'rejected'
              return (
                <div className="scheduled-row" key={user.id}>
                  <div>
                    <strong>{user.nickname}</strong>
                    <p className="muted">@{user.username}</p>
                  </div>
                  <button
                    className="button secondary"
                    disabled={
                      mutation.pending ||
                      connected ||
                      friendships.loading ||
                      Boolean(friendships.error)
                    }
                    onClick={() =>
                      action(
                        '/friendships/',
                        'POST',
                        { user_id: user.id },
                        t(
                          '好友申请已保存，请等待对方处理。',
                          'Friend request saved. Waiting for a response.',
                        ),
                      )
                    }
                  >
                    {connected
                      ? relation.status === 'accepted'
                        ? t('已是好友', 'Already friends')
                        : t('申请待处理', 'Request pending')
                      : t('申请好友', 'Send request')}
                  </button>
                </div>
              )
            })
          ) : (
            <p className="empty-state">
              {t('没有找到用户。', 'No users found.')}
            </p>
          )}
        </section>
      )}
      {pending.length > 0 && (
        <section className="panel">
          <h2>{t('好友申请', 'Friend requests')}</h2>
          {pending.map((item) => (
            <div className="scheduled-row" key={item.id}>
              <div>
                <strong>
                  {item.user.nickname} (@{item.user.username})
                </strong>
                <p className="muted">
                  {item.incoming
                    ? t('对方申请添加你为好友', 'Wants to be your friend')
                    : t('等待对方接受', 'Waiting for their response')}
                </p>
              </div>
              {item.incoming && (
                <div className="row-actions">
                  <button
                    className="button primary"
                    disabled={mutation.pending}
                    onClick={() =>
                      action(
                        '/friendships/' + item.id + '/',
                        'PATCH',
                        { status: 'accepted' },
                        t('已接受好友申请。', 'Friend request accepted.'),
                      )
                    }
                  >
                    {t('接受', 'Accept')}
                  </button>
                  <button
                    className="button secondary"
                    disabled={mutation.pending}
                    onClick={() =>
                      action(
                        '/friendships/' + item.id + '/',
                        'PATCH',
                        { status: 'rejected' },
                        t('已拒绝好友申请。', 'Friend request declined.'),
                      )
                    }
                  >
                    {t('拒绝', 'Decline')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
      <div className="friend-grid">
        {friends.map(({ user }) => (
          <article className="panel friend-card" key={user.id}>
            <span className="avatar large sage">
              {user.nickname.slice(0, 2).toUpperCase()}
            </span>
            <h2>{user.nickname}</h2>
            <p className="muted">@{user.username}</p>
            <p className="small-print">
              {t(
                '只显示对方明确授权给你的植物。',
                'Only plants this friend explicitly shares with you are visible.',
              )}
            </p>
            <button
              className="button secondary full-width"
              onClick={() => setSelectedFriend(user)}
            >
              {t('查看已授权植物', 'View shared plants')}
            </button>
            <button
              className="text-button"
              disabled={mutation.pending}
              onClick={() =>
                action(
                  '/notifications/',
                  'POST',
                  {
                    recipient: user.id,
                    message: t(
                      '有空时请先检查植物的土壤和叶片，再决定是否需要养护。',
                      'When you have time, check the soil and leaves before deciding on care.',
                    ),
                  },
                  t(
                    '站内提醒已保存，对方可在“站内提醒”中查看。',
                    'Reminder saved. Your friend can read it in their inbox.',
                  ),
                )
              }
            >
              {t('发送站内养护提醒', 'Send care reminder')}
            </button>
          </article>
        ))}
      </div>
      {!friendships.loading && !friendships.error && !friends.length && (
        <p className="empty-state">
          {t(
            '还没有好友。搜索另一个已注册账户的用户名开始。',
            'No friends yet. Search another registered username to get started.',
          )}
        </p>
      )}
      {selectedFriend && (
        <FriendPlants
          friend={selectedFriend}
          t={t}
          language={language}
          onClose={() => setSelectedFriend(null)}
          onPlant={(plant) => {
            setSelectedFriend(null)
            onPlant(plant)
          }}
        />
      )}
    </>
  )
}
