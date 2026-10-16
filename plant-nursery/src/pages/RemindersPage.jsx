import PageHeading from '../components/PageHeading'
import PlantArt from '../components/PlantArt'
import HistoryPanel from '../components/HistoryPanel'
import Icon from '../components/Icon'
import { localize, formatTime } from '../data/formatters'

export default function RemindersPage({
  t,
  language,
  myPlants,
  summary,
  scope,
  onCare,
}) {
  const due = myPlants.filter((plant) => plant.check_status === 'due')
  const overdue = myPlants.filter((plant) => plant.check_status === 'overdue')
  const scheduled = myPlants.filter(
    (plant) => plant.check_status === 'scheduled',
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
            '提醒是检查提示，不是必须浇水。延后检查为 2 小时，其他结果安排 24 小时后检查。超过安排时间 24 小时标记为逾期；提醒仅在网页内显示。',
            'A reminder asks you to check, not to water. Postpone by 2 hours, or check again after 24 hours for other outcomes. Checks more than 24 hours late are overdue. In-page reminders only.',
          )}
        </span>
      </div>
      {[
        [overdue, t('已逾期', 'Overdue'), summary.overdue],
        [due, t('待检查', 'Ready to check'), summary.due],
      ].map(([plants, title, count]) => (
        <section key={title}>
          <div className="section-heading">
            <h2>{title}</h2>
            <span className="tag amber">{count}</span>
          </div>
          <div className="reminder-grid">
            {plants.map((plant) => (
              <article className="panel reminder-card" key={plant.id}>
                <div className="reminder-intro">
                  <span
                    className="reminder-art"
                    style={{ background: plant.species.color }}
                  >
                    <PlantArt type={plant.species.type} />
                  </span>
                  <div>
                    <h3>{plant.nickname}</h3>
                    <p className="muted">{plant.location}</p>
                    <small className="muted">
                      {formatTime(plant.next_check_at, language)}
                    </small>
                  </div>
                </div>
                <p>{localize(plant.species.check, language)}</p>
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
          {!plants.length && (
            <p className="small-print">
              {t('暂无此类检查。', 'No checks in this group.')}
            </p>
          )}
        </section>
      ))}
      <section className="panel scheduled-panel">
        <h2>{t('未来检查安排', 'Upcoming checks')}</h2>
        {scheduled.length ? (
          scheduled.map((plant) => (
            <div className="scheduled-row" key={plant.id}>
              <span className="round-icon">
                <Icon name="clock" />
              </span>
              <div>
                <strong>
                  {plant.nickname} · {plant.location}
                </strong>
                <p className="muted">
                  {formatTime(plant.next_check_at, language)}
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
              '完成一次检查后，这里会显示下次安排。',
              'Your next scheduled check appears here after recording care.',
            )}
          </p>
        )}
      </section>
      <section className="panel">
        <HistoryPanel key={scope} scope={scope} t={t} language={language} />
      </section>
    </>
  )
}
