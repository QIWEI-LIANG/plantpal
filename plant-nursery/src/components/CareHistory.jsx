import Icon from './Icon'
import { formatTime, observationText, outcomeText } from '../data/formatters'

export default function CareHistory({
  entries,
  t,
  language,
  showPlant = false,
}) {
  if (!entries.length)
    return (
      <p className="empty-state">
        {t(
          '还没有养护记录。完成一次检查后，记录会出现在这里。',
          'No care history yet. Complete a check to start your timeline.',
        )}
      </p>
    )
  return (
    <ol className="history-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <span className={`history-icon ${entry.outcome}`}>
            <Icon
              name={
                entry.outcome === 'watered'
                  ? 'drop'
                  : entry.outcome === 'later'
                    ? 'clock'
                    : 'check'
              }
              size={17}
            />
          </span>
          <div>
            <strong>
              {showPlant && (
                <>
                  {entry.plant_name} · {entry.plant_location} ·{' '}
                </>
              )}
              {outcomeText(entry.outcome, language)}
            </strong>
            <p>
              {observationText(entry.observation, language)} ·{' '}
              {entry.actor.nickname} (@{entry.actor.username})
              {entry.role === 'caretaker' && ` (${t('代管者', 'caretaker')})`}
            </p>
            <time dateTime={entry.timestamp}>
              {formatTime(entry.timestamp, language)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  )
}
