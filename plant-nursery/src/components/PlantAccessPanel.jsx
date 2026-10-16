import { useState } from 'react'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import AsyncState from './AsyncState'
import { api } from '../services/api'

export default function PlantAccessPanel({ plantId, t, language }) {
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('')
  const accesses = useApiResource('/plants/' + plantId + '/access/')
  const friendships = useApiResource('/friendships/', { all: true })
  const mutation = useMutation()
  const friends = (friendships.data || []).filter(
    (item) => item.status === 'accepted',
  )
  async function grant(event) {
    event.preventDefault()
    const result = await mutation.run(() =>
      api('/plants/' + plantId + '/access/', {
        method: 'POST',
        body: { user_id: Number(userId) },
      }),
    )
    if (result.ok) {
      accesses.reload()
      setMessage(
        t(
          '授权已保存，对方现在可以查看并记录这盆植物。',
          'Access saved. Your friend can now view and record care for this plant.',
        ),
      )
    }
  }
  async function revoke(id) {
    const result = await mutation.run(() =>
      api('/plants/' + plantId + '/access/' + id + '/', { method: 'DELETE' }),
    )
    if (result.ok) {
      accesses.reload()
      setMessage(
        t(
          '授权已撤销，对方后续请求将立即被拒绝。',
          'Access revoked. Further requests from that user are now denied.',
        ),
      )
    }
  }
  return (
    <section className="access-panel">
      <h3>{t('授权好友代管这盆植物', 'Share care for this plant')}</h3>
      <p className="small-print">
        {t(
          '好友关系不会自动共享植物。代管者只能查看和记录，不能编辑说明、删除或再次授权。',
          'Friendship alone shares no plants. Caretakers can view and record care, but cannot edit, delete or grant access.',
        )}
      </p>
      <AsyncState
        loading={accesses.loading || friendships.loading}
        error={accesses.error || friendships.error}
        onRetry={() => {
          accesses.reload()
          friendships.reload()
        }}
        t={t}
        language={language}
      />
      {!accesses.loading &&
        !friendships.loading &&
        !accesses.error &&
        !friendships.error && (
          <>
            <form className="inline-form" onSubmit={grant}>
              <label className="field-label">
                {t('选择已成为好友的用户', 'Choose an accepted friend')}
                <select
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  required
                >
                  <option value="">{t('请选择好友', 'Choose a friend')}</option>
                  {friends.map(({ user }) => (
                    <option key={user.id} value={user.id}>
                      {user.nickname} (@{user.username})
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button secondary"
                disabled={mutation.pending || !userId}
              >
                {t('授权代管', 'Grant care access')}
              </button>
            </form>
            {!friends.length && (
              <p className="muted">
                {t(
                  '先到“我的好友”发送申请，并由对方接受。',
                  'Send a friend request in My friends and ask them to accept first.',
                )}
              </p>
            )}
            {(accesses.data || []).map((access) => (
              <div className="scheduled-row" key={access.id}>
                <span>
                  {access.caretaker.nickname} (@{access.caretaker.username})
                </span>
                {access.active ? (
                  <button
                    className="button secondary"
                    disabled={mutation.pending}
                    onClick={() => revoke(access.id)}
                  >
                    {t('撤销授权', 'Revoke access')}
                  </button>
                ) : (
                  <span className="tag">{t('已撤销', 'Revoked')}</span>
                )}
              </div>
            ))}
          </>
        )}
      <AsyncState error={mutation.error} t={t} language={language} />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
