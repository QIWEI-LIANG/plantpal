import PageHeading from '../components/PageHeading'
import PlantArt from '../components/PlantArt'
import Icon from '../components/Icon'
import CareHistory from '../components/CareHistory'
import { localize, formatTime } from '../data/formatters'

export default function RemindersPage({
  t,
  language,
  myPlants,
  duePlants,
  state,
  onCare,
}) {
  const scheduled = myPlants.filter(
    (plant) => !duePlants.some((due) => due.id === plant.id),
  )
  return (
    <>
      <PageHeading
        eyebrow="OBSERVE · DECIDE · RECORD"
        title={t('养护提醒', 'Care reminders')}
        description={t(
          '先检查土壤和叶片，再选择适合现在的养护。',
          'Check the soil and leaves, then choose what your plant needs now.',
        )}
      />
      <div className="notice">
        <Icon name="leaf" />
        <span>
          {t(
            '这是检查提醒，不是固定浇水指令。示例检查间隔为 24 小时，暂缓为 2 小时；实际养护请以植物状态为准。提醒仅在网页内显示。',
            'These are prompts to check, not fixed watering instructions. Demo checks repeat after 24 hours, or 2 hours when postponed. Let actual conditions guide care. Reminders appear in this webpage only.',
          )}
        </span>
      </div>
      <div className="section-heading">
        <h2>{t('现在可以检查', 'Ready to check')}</h2>
        <span className="tag amber">{duePlants.length}</span>
      </div>
      <div className="reminder-grid">
        {duePlants.map((plant) => (
          <article className="panel reminder-card" key={plant.id}>
            <div className="reminder-intro">
              <span
                className="reminder-art"
                style={{ background: plant.color }}
              >
                <PlantArt type={plant.type} />
              </span>
              <div>
                <span className="tag amber">{t('待检查', 'Check due')}</span>
                <h3>{localize(plant.name, language)}</h3>
                <p className="muted">{localize(plant.location, language)}</p>
                <small className="muted">
                  {t('安排时间', 'Scheduled')}:{' '}
                  {formatTime(
                    state.reminders[plant.id] || new Date().toISOString(),
                    language,
                  )}
                </small>
              </div>
            </div>
            <p>{localize(plant.check, language)}</p>
            <button
              className="button primary full-width"
              onClick={() => onCare(plant)}
            >
              {t('开始检查', 'Start check')}
              <Icon name="arrow" size={17} />
            </button>
          </article>
        ))}
      </div>
      {!duePlants.length && (
        <div className="empty-state">
          <Icon name="check" size={36} />
          <h3>{t('当前没有待检查事项', 'All caught up')}</h3>
          <p>
            {t(
              '下次检查时间在下面，也可以随时主动检查。',
              'Your next checks are below. You can also check anytime.',
            )}
          </p>
        </div>
      )}
      <section className="panel scheduled-panel">
        <h2>{t('接下来', 'Coming up')}</h2>
        {scheduled.length ? (
          scheduled.map((plant) => (
            <div className="scheduled-row" key={plant.id}>
              <span className="round-icon">
                <Icon name="clock" />
              </span>
              <div>
                <strong>{localize(plant.name, language)}</strong>
                <p className="muted">
                  {formatTime(state.reminders[plant.id], language)}
                </p>
              </div>
              <button
                className="button secondary"
                onClick={() => onCare(plant)}
              >
                {t('提前检查', 'Check now')}
              </button>
            </div>
          ))
        ) : (
          <p className="muted">
            {t(
              '完成一次检查后，这里会显示下次时间。',
              'Complete a check to see the next scheduled time here.',
            )}
          </p>
        )}
      </section>
      <section className="panel">
        <h2>{t('集中养护历史', 'All care history')}</h2>
        <p className="muted">
          {t(
            '每次操作都保存时间、观察结果和操作者。',
            'Each action records its time, observation, and person.',
          )}
        </p>
        <CareHistory
          entries={state.history}
          t={t}
          language={language}
          showPlant
        />
      </section>
    </>
  )
}
