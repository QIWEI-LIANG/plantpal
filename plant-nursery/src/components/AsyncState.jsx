import { errorMessage } from '../services/api'

export default function AsyncState({ loading, error, onRetry, t, language }) {
  if (loading)
    return (
      <p className="notice" role="status">
        {t('正在加载…', 'Loading…')}
      </p>
    )
  if (error)
    return (
      <div className="form-error" role="alert">
        <p>{errorMessage(error, language)}</p>
        {onRetry && (
          <button className="button secondary" onClick={onRetry}>
            {t('重试', 'Retry')}
          </button>
        )}
      </div>
    )
  return null
}
