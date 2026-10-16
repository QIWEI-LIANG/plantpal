import { useState } from 'react'
import useMutation from '../hooks/useMutation'
import AsyncState from './AsyncState'

export default function PlantForm({
  initial = {},
  onSubmit,
  onSuccess,
  t,
  language,
  submitLabel,
}) {
  const [nickname, setNickname] = useState(initial.nickname || '')
  const [location, setLocation] = useState(initial.location || '')
  const [notes, setNotes] = useState(initial.owner_notes || '')
  const mutation = useMutation()
  async function submit(event) {
    event.preventDefault()
    const result = await mutation.run(() =>
      onSubmit({
        nickname: nickname.trim(),
        location: location.trim(),
        owner_notes: notes.trim(),
      }),
    )
    if (result.ok) onSuccess(result.data)
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        {t('这盆植物的昵称', 'Plant nickname')}
        <input
          required
          maxLength="80"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </label>
      <label>
        {t('位置', 'Location')}
        <input
          required
          maxLength="120"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={t('例如：客厅窗边', 'e.g. Living room window')}
        />
      </label>
      <label>
        {t('主人说明 / 代管说明', 'Owner / caretaker instructions')}
        <textarea
          rows="3"
          maxLength="600"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t(
            '提醒代管者观察什么，不确定时该怎么做。',
            'Tell the sitter what to observe and what to do if unsure.',
          )}
        />
      </label>
      <AsyncState error={mutation.error} t={t} language={language} />
      <button
        type="submit"
        className="button primary"
        disabled={mutation.pending || !nickname.trim() || !location.trim()}
      >
        {mutation.pending ? t('正在保存…', 'Saving…') : submitLabel}
      </button>
    </form>
  )
}
