import { useEffect, useRef, useState } from 'react'
import useMutation from '../hooks/useMutation'
import AsyncState from './AsyncState'
import { toLocalDateTime } from '../data/formatters'

export default function PlantForm({
  initial = {},
  onSubmit,
  onSuccess,
  t,
  language,
  submitLabel,
  formId,
  showSchedule = true,
}) {
  const [nickname, setNickname] = useState(initial.nickname || '')
  const [location, setLocation] = useState(initial.location || '')
  const [notes, setNotes] = useState(initial.owner_notes || '')
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState('')
  const [removeCover, setRemoveCover] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef(null)
  const mutation = useMutation()
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  function chooseCover(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setFileError(
        t(
          '请选择 5 MB 以内的 JPG、PNG 或 WebP 图片。',
          'Choose a JPG, PNG or WebP image under 5 MB.',
        ),
      )
      event.target.value = ''
      return
    }
    setFileError('')
    setCover(file)
    setRemoveCover(false)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(event) {
    event.preventDefault()
    if (fileError) return
    const nextCheck = new FormData(event.currentTarget).get('next_check_at')
    const values = {
      nickname: nickname.trim(),
      location: location.trim(),
      owner_notes: notes.trim(),
      ...(nextCheck && { next_check_at: new Date(nextCheck).toISOString() }),
      ...(removeCover && { cover: null }),
    }
    let body = values
    if (cover) {
      body = new FormData()
      Object.entries(values).forEach(([key, value]) => body.append(key, value))
      body.append('cover', cover)
    }
    const result = await mutation.run(() => onSubmit(body))
    if (result.ok) {
      setCover(null)
      setPreview('')
      setRemoveCover(false)
      if (fileRef.current) fileRef.current.value = ''
      onSuccess(result.data)
    }
  }
  return (
    <form id={formId} className="stack-form" onSubmit={submit}>
      <div className="cover-field">
        <span>{t('植物封面', 'Plant cover')}</span>
        {(preview || (!removeCover && initial.cover_url)) && (
          <div className="cover-preview">
            <img
              src={preview || initial.cover_url}
              alt={t('植物封面预览', 'Plant cover preview')}
            />
          </div>
        )}
        <div className="row-actions">
          <label className="button secondary cover-upload">
            {t('上传 / 更换封面', 'Upload / replace cover')}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseCover}
              aria-label={t('上传植物封面', 'Upload plant cover')}
              disabled={mutation.pending}
            />
          </label>
          {(cover || (!removeCover && initial.cover_url)) && (
            <button
              type="button"
              className="text-button"
              disabled={mutation.pending}
              onClick={() => {
                setCover(null)
                setPreview('')
                setRemoveCover(true)
                setFileError('')
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              {t('恢复默认插画', 'Use default illustration')}
            </button>
          )}
        </div>
        <small className="muted">
          {t(
            'JPG / PNG / WebP，最大 5 MB；保存后生效。',
            'JPG / PNG / WebP, up to 5 MB. Applied after saving.',
          )}
        </small>
        {fileError && (
          <p className="form-error" role="alert">
            {fileError}
          </p>
        )}
      </div>
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
      {showSchedule && (
        <label>
          {t('下次检查时间', 'Next check time')}
          <input
            type="datetime-local"
            name="next_check_at"
            defaultValue={toLocalDateTime(initial.next_check_at)}
          />
          <small className="muted">
            {t(
              '按你当前时区保存；留空则立即安排检查。',
              'Saved in your local time zone. Leave blank to schedule a check now.',
            )}
          </small>
        </label>
      )}
      <AsyncState error={mutation.error} t={t} language={language} />
      <button
        type="submit"
        className="button primary"
        disabled={
          mutation.pending ||
          !!fileError ||
          !nickname.trim() ||
          !location.trim()
        }
      >
        {mutation.pending ? t('正在保存…', 'Saving…') : submitLabel}
      </button>
    </form>
  )
}
